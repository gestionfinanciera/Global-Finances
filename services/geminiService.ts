
import { GoogleGenAI, Type } from "@google/genai";
import { CHART_OF_ACCOUNTS } from "../accounts";

export interface PredictedEntry {
  description: string;
  debitParts: { accountId: string; amount: number }[];
  creditParts: { accountId: string; amount: number }[];
  isOpening?: boolean;
}

/**
 * Servicio centralizado para interactuar con los modelos de Google Gemini.
 * Utiliza exclusivamente process.env.API_KEY.
 */
export const geminiService = {
  /**
   * Chat interactivo con el asesor financiero "Cyber Advisor".
   * Ideal para consultas complejas de normativa contable o análisis de estados.
   */
  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          { role: 'user', parts: [{ text: `Sistema: Eres el asesor financiero "Cyber Advisor" de Global Finances. 
          Tu tono es tecnológico, premium y profesional.
          Experticia: Contabilidad de partida doble, gestión de impuestos, flujos de caja e inventarios.
          Reglas: El DEBE aumenta Activos/Gastos. El HABER aumenta Pasivos/Patrimonio/Ingresos.
          Historial previo: ${JSON.stringify(history)}` }]},
          { role: 'user', parts: [{ text: message }]}
        ],
        config: {
          temperature: 0.7,
          topP: 0.95,
        }
      });

      return response.text || "Lo siento, no pude procesar tu consulta en este momento.";
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      return "Error de conexión con el servicio de IA. Asegúrate de que la API Key sea válida.";
    }
  },

  /**
   * Automatización de asientos: Predice las cuentas contables basándose en una descripción.
   * Por ejemplo: "Pago alquiler con transferencia" -> Dr: Alquileres, Cr: Bancos.
   */
  async predictAccounts(description: string): Promise<PredictedEntry | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const accountContext = CHART_OF_ACCOUNTS.map(a => `${a.id}: ${a.name} (${a.type})`).join(", ");

    const prompt = `Actúa como un contador experto. Analiza: "${description}".
    Genera un asiento contable balanceado (Debe = Haber).
    CUENTAS DISPONIBLES: [${accountContext}].
    Retorna estrictamente un objeto JSON.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              debitParts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    accountId: { type: Type.STRING },
                    amount: { type: Type.NUMBER }
                  },
                  required: ["accountId", "amount"]
                }
              },
              creditParts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    accountId: { type: Type.STRING },
                    amount: { type: Type.NUMBER }
                  },
                  required: ["accountId", "amount"]
                }
              },
              isOpening: { type: Type.BOOLEAN }
            },
            required: ["description", "debitParts", "creditParts"]
          }
        }
      });

      const text = response.text;
      return text ? JSON.parse(text) : null;
    } catch (e) {
      console.error("Error en predictAccounts:", e);
      return null;
    }
  },

  /**
   * Visión Artificial: Analiza imágenes de libros diarios u hojas contables.
   */
  async analyzeLedger(base64Image: string): Promise<any[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const accountContext = CHART_OF_ACCOUNTS.map(a => `${a.id}: ${a.name}`).join(", ");

    const prompt = `Analiza este libro diario. Detecta fecha, descripción y cuentas.
    Mapea las cuentas a estos IDs: [${accountContext}].
    Retorna un array JSON de asientos.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                debitParts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      accountId: { type: Type.STRING },
                      amount: { type: Type.NUMBER }
                    },
                    required: ["accountId", "amount"]
                  }
                },
                creditParts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      accountId: { type: Type.STRING },
                      amount: { type: Type.NUMBER }
                    },
                    required: ["accountId", "amount"]
                  }
                }
              },
              required: ["date", "description", "debitParts", "creditParts"]
            }
          }
        }
      });

      const text = response.text;
      return text ? JSON.parse(text) : [];
    } catch (e) {
      console.error("Error en analyzeLedger:", e);
      return [];
    }
  },

  /**
   * Visión Artificial: Analiza un recibo o ticket de compra individual.
   */
  async analyzeReceipt(base64Image: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Extrae información de este ticket: monto total, fecha, descripción y sugiere un ID de cuenta de gasto (ej: acc_bank, acc_office_supplies).
    Retorna un JSON.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              date: { type: Type.STRING },
              description: { type: Type.STRING },
              recommendedAccount: { type: Type.STRING }
            },
            required: ["amount", "date", "description", "recommendedAccount"]
          }
        }
      });

      const text = response.text;
      return text ? JSON.parse(text) : null;
    } catch (e) {
      console.error("Error en analyzeReceipt:", e);
      return null;
    }
  }
};
