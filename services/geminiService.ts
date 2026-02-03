
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { CHART_OF_ACCOUNTS } from "../accounts";

const API_KEY = import.meta.env.VITE_API_KEY;

export interface PredictedEntry {
  description: string;
  debitParts: { accountId: string; amount: number }[];
  creditParts: { accountId: string; amount: number }[];
  isOpening?: boolean;
}

export const geminiService = {
  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
    if (!API_KEY) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
    
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are a professional financial advisor and accounting teacher for the "Global Finances" app. 
        Your goal is to help users manage their money and understand double-entry bookkeeping. 
        Keep answers clear, educational, and professional. 
        The app uses the following rules:
        - Assets (Activos) and Expenses (Gastos): Increase on DEBIT (Debe), Decrease on CREDIT (Haber).
        - Liabilities (Pasivos), Equity (Patrimonio), and Income (Resultados +): Increase on CREDIT (Haber), Decrease on DEBIT (Debe).
        Every transaction must balance (Double Entry).`,
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text || "Sorry, I couldn't process that.";
  },

  async predictAccounts(description: string): Promise<PredictedEntry | null> {
    if (!API_KEY) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const accountContext = CHART_OF_ACCOUNTS.map(a => `${a.id}: ${a.name} (${a.type})`).join(", ");

    const prompt = `Act as a professional accountant. Analyze this description: "${description}".
    Extract ALL accounts and their corresponding amounts for a balanced journal entry (Libro Diario).
    
    ACCOUNTING RULES (Partida Doble):
    - DEBIT (Debe): Asset (+A) or Expense (+RN) increases. Liability (-P) or Equity (-PN) decreases.
    - CREDIT (Haber): Liability (+P), Equity (+PN), or Income (+RP) increases. Asset (-A) decreases.
    - SUM(DEBIT) MUST EQUAL SUM(CREDIT).
    
    AVAILABLE ACCOUNTS: [${accountContext}].
    
    If the text describes multiple starting items (Opening Inventory / Asiento de Apertura), balance the total Assets/Liabilities against Capital/Equity.
    
    Return ONLY a JSON object:
    {
      "description": "Short summary",
      "debitParts": [{"accountId": "id", "amount": 100}],
      "creditParts": [{"accountId": "id", "amount": 100}],
      "isOpening": true/false
    }`;

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
      const text = response.text.trim();
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse prediction JSON", e);
      return null;
    }
  },

  async analyzeLedger(base64Image: string): Promise<any[]> {
    if (!API_KEY) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const accountContext = CHART_OF_ACCOUNTS.map(a => `${a.id}: ${a.name}`).join(", ");

    const prompt = `Analyze this handwritten or printed accounting ledger (Libro Diario). 
    Extract ALL journal entries visible in the image.
    For each entry, extract:
    - date (YYYY-MM-DD format, estimate year as current if not present)
    - description (text in 'Detalle' column, e.g., 'Venta mercadería')
    - debitParts: list of objects with { accountId (match from system accounts), amount (number) }
    - creditParts: list of objects with { accountId (match from system accounts), amount (number) }
    
    SYSTEM ACCOUNT IDS: [${accountContext}]. Try to map the names in the image to these IDs.
    
    Return a JSON array of objects. Ensure Debe equals Haber for each entry.`;

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
      console.error("Failed to parse Ledger JSON", e);
      return [];
    }
  },

  async analyzeReceipt(base64Image: string): Promise<any> {
    if (!API_KEY) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = `Analyze this receipt or invoice. Extract the following information in JSON format: 
    - amount (number)
    - date (YYYY-MM-DD)
    - description (string, summary of what was bought)
    - recommendedAccount (string, one of the account IDs from the system)`;

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
      console.error("Failed to parse JSON from Gemini", e);
      return null;
    }
  }
};
