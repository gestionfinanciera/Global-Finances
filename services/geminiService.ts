
import { GoogleGenAI, Type } from "@google/genai";
import { CHART_OF_ACCOUNTS } from "../accounts";

export interface PredictedEntry {
  date?: string;
  description: string;
  amount?: number;
  debitParts: { accountId: string; amount: number }[];
  creditParts: { accountId: string; amount: number }[];
  isOpening?: boolean;
}

export const geminiService = {
  // Chat functionality for the financial assistant
  async chat(message: string, history: any[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          { role: 'user', parts: [{ text: `Sistema: Eres "Cyber Advisor". Experto en contabilidad cloud. Historial: ${JSON.stringify(history)}` }]},
          { role: 'user', parts: [{ text: message }]}
        ]
      });
      return response.text || "No hay respuesta.";
    } catch (e) {
      console.error(e);
      return "Error de conexión con Gemini.";
    }
  },

  // Predicts accounts for a manual entry description
  async predictAccounts(description: string): Promise<PredictedEntry | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const context = CHART_OF_ACCOUNTS.map(a => `${a.id}: ${a.name}`).join(", ");
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `Analiza: "${description}". Cuentas: [${context}]. Retorna JSON.` }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              debitParts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { accountId: { type: Type.STRING }, amount: { type: Type.NUMBER } } } },
              creditParts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { accountId: { type: Type.STRING }, amount: { type: Type.NUMBER } } } }
            },
            required: ["description", "debitParts", "creditParts"]
          }
        }
      });
      return response.text ? JSON.parse(response.text) : null;
    } catch (e) {
      return null;
    }
  },

  // Analyzes a photo of a journal ledger (multiple entries)
  async analyzeLedger(base64: string): Promise<PredictedEntry[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const context = CHART_OF_ACCOUNTS.map(a => `${a.id}: ${a.name}`).join(", ");
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: `Analiza esta imagen de un libro diario contable. Extrae cada asiento. Cuentas sugeridas: [${context}]. Retorna un array JSON con campos date, description, amount, debitParts y creditParts.` },
              { inlineData: { mimeType: 'image/jpeg', data: base64 } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                debitParts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { accountId: { type: Type.STRING }, amount: { type: Type.NUMBER } } } },
                creditParts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { accountId: { type: Type.STRING }, amount: { type: Type.NUMBER } } } }
              },
              required: ["date", "description", "amount", "debitParts", "creditParts"]
            }
          }
        }
      });
      return response.text ? JSON.parse(response.text) : [];
    } catch (e) {
      console.error("Ledger analysis error:", e);
      return [];
    }
  },

  // Analyzes a photo of a single receipt or invoice
  async analyzeReceipt(base64: string): Promise<PredictedEntry | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const context = CHART_OF_ACCOUNTS.map(a => `${a.id}: ${a.name}`).join(", ");
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: `Analiza esta factura o recibo. Extrae la fecha, el monto total y una descripción breve. También sugiere las cuentas contables para un asiento. Cuentas: [${context}]. Retorna JSON con campos date, description, amount, debitParts y creditParts.` },
              { inlineData: { mimeType: 'image/jpeg', data: base64 } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              debitParts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { accountId: { type: Type.STRING }, amount: { type: Type.NUMBER } } } },
              creditParts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { accountId: { type: Type.STRING }, amount: { type: Type.NUMBER } } } }
            },
            required: ["date", "description", "amount", "debitParts", "creditParts"]
          }
        }
      });
      return response.text ? JSON.parse(response.text) : null;
    } catch (e) {
      console.error("Receipt analysis error:", e);
      return null;
    }
  }
};
