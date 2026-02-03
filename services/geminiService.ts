
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { CHART_OF_ACCOUNTS } from "../accounts";

export interface PredictedEntry {
  description: string;
  debitParts: { accountId: string; amount: number }[];
  creditParts: { accountId: string; amount: number }[];
  isOpening?: boolean;
}

export const geminiService = {
  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `Eres un asesor financiero profesional y profesor de contabilidad para la aplicación "Global Finances". 
        Tu objetivo es ayudar a los usuarios a gestionar su dinero y entender la contabilidad de partida doble. 
        Mantén respuestas claras, educativas y profesionales. 
        La aplicación usa las siguientes reglas:
        - Activos y Gastos: Aumentan por el DEBE, disminuyen por el HABER.
        - Pasivos, Patrimonio e Ingresos: Aumentan por el HABER, disminuyen por el DEBE.
        Cada transacción debe estar balanceada.`,
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text || "Lo siento, no pude procesar esa solicitud.";
  },

  async predictAccounts(description: string): Promise<PredictedEntry | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const accountContext = CHART_OF_ACCOUNTS.map(a => `${a.id}: ${a.name} (${a.type})`).join(", ");

    const prompt = `Actúa como un contador profesional. Analiza esta descripción: "${description}".
    Extrae TODAS las cuentas y sus montos correspondientes para un asiento contable balanceado (Libro Diario).
    
    REGLAS CONTABLES:
    - DEBE: Aumenta Activo (+A) o Gasto (+RN). Disminuye Pasivo (-P) o Patrimonio (-PN).
    - HABER: Aumenta Pasivo (+P), Patrimonio (+PN) o Ingreso (+RP). Disminuye Activo (-A).
    - LA SUMA DEL DEBE DEBE SER IGUAL A LA SUMA DEL HABER.
    
    CUENTAS DISPONIBLES: [${accountContext}].
    
    Si el texto describe elementos iniciales (Asiento de Apertura), balancea Activos/Pasivos contra Capital/Patrimonio.
    
    Retorna ÚNICAMENTE un objeto JSON.`;

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

    try {
      return JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Error al parsear predicción JSON", e);
      return null;
    }
  },

  async analyzeLedger(base64Image: string): Promise<any[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const accountContext = CHART_OF_ACCOUNTS.map(a => `${a.id}: ${a.name}`).join(", ");

    const prompt = `Analiza este libro diario contable. Extrae TODOS los asientos visibles.
    Mapea los nombres de las cuentas a estos IDs de sistema: [${accountContext}].
    Asegúrate de que el Debe sea igual al Haber para cada asiento.
    Retorna un array de objetos JSON.`;

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

    try {
      return JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Error al parsear Ledger JSON", e);
      return [];
    }
  },

  async analyzeReceipt(base64Image: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Analiza este recibo o factura. Extrae: monto, fecha, descripción y cuenta recomendada del sistema.
    Retorna un objeto JSON.`;

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

    try {
      return JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Error al parsear JSON de Gemini", e);
      return null;
    }
  }
};
