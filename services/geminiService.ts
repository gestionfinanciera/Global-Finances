
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { CHART_OF_ACCOUNTS } from "../accounts";

export interface PredictedEntry {
  description: string;
  debitParts: { accountId: string; amount: number }[];
  creditParts: { accountId: string; amount: number }[];
  isOpening?: boolean;
}

export const geminiService = {
  /**
   * Chat interactivo con el asesor financiero.
   * Utiliza gemini-3-pro-preview para razonamiento avanzado.
   */
  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: `Eres el asesor financiero "Cyber Advisor" de Global Finances. 
          Tu tono es tecnológico, premium y profesional.
          Experticia: Contabilidad de partida doble, gestión de impuestos (AFIP/Argentina), flujos de caja y análisis de inventario.
          Reglas de oro:
          1. El DEBE (izq) aumenta Activos y Gastos.
          2. El HABER (der) aumenta Pasivos, Patrimonio e Ingresos.
          3. Siempre balancea: Debe = Haber.
          Ayuda al usuario a entender sus finanzas con claridad meridiana.`,
        },
      });

      const response = await chat.sendMessage({ message });
      return response.text || "No obtuve una respuesta válida del asesor.";
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      if (error?.message?.includes("Requested entity was not found")) {
        return "Error de configuración de API. Por favor, verifica tu clave en los ajustes.";
      }
      return "Hubo un problema de conexión con el asesor financiero.";
    }
  },

  /**
   * Predice las cuentas contables basándose en una descripción de texto.
   * Utiliza gemini-3-flash-preview para velocidad y respuestas estructuradas.
   */
  async predictAccounts(description: string): Promise<PredictedEntry | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const accountContext = CHART_OF_ACCOUNTS.map(a => `${a.id}: ${a.name} (${a.type})`).join(", ");

    const prompt = `Actúa como un contador experto. Analiza la siguiente descripción: "${description}".
    Genera un asiento contable balanceado.
    
    CUENTAS DISPONIBLES: [${accountContext}].
    
    REQUISITOS:
    - Identifica qué cuentas se debitan (Debe) y cuáles se acreditan (Haber).
    - Asegúrate de que la suma de debitParts sea IGUAL a la suma de creditParts.
    - Si se mencionan varios items, desglósalos proporcionalmente.
    
    Retorna estrictamente un objeto JSON.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: prompt,
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

      return JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Error en predictAccounts:", e);
      return null;
    }
  },

  /**
   * Analiza una imagen de un libro diario escrito a mano o impreso.
   * Requiere gemini-3-pro-preview para visión y lógica compleja.
   */
  async analyzeLedger(base64Image: string): Promise<any[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const accountContext = CHART_OF_ACCOUNTS.map(a => `${a.id}: ${a.name}`).join(", ");

    const prompt = `Analiza la imagen de este libro diario contable. 
    Detecta cada asiento con su fecha, descripción y cuentas.
    Mapea las cuentas detectadas a estos IDs del sistema: [${accountContext}].
    Si una cuenta no existe exactamente, usa la más cercana por categoría.
    Retorna un array JSON de asientos.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        },
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

      return JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Error en analyzeLedger:", e);
      return [];
    }
  },

  /**
   * Analiza un recibo o ticket de compra individual.
   */
  async analyzeReceipt(base64Image: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Extrae la información de este ticket/factura:
    1. Monto total.
    2. Fecha.
    3. Descripción breve.
    4. Sugiere un ID de cuenta de gasto (ej: acc_utilities_electricity, acc_office_supplies).
    Retorna un JSON.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        },
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

      return JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Error en analyzeReceipt:", e);
      return null;
    }
  }
};
