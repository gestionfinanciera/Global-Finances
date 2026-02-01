
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { CHART_OF_ACCOUNTS } from "../accounts";

const API_KEY = process.env.API_KEY;

export const geminiService = {
  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
    if (!API_KEY) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
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

  async predictAccounts(description: string): Promise<{ debitAccount: string, creditAccount: string } | null> {
    if (!API_KEY) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const accountContext = CHART_OF_ACCOUNTS.map(a => `${a.id}: ${a.name} (${a.type})`).join(", ");

    const prompt = `Based on this professional accounting transaction description: "${description}", select the most appropriate Debit (Debe) and Credit (Haber) account IDs.
    
    ACCOUNTING RULES:
    - DEBIT (Debe): Increase in ASSETS or EXPENSES, or decrease in LIABILITIES/EQUITY.
    - CREDIT (Haber): Increase in LIABILITIES, EQUITY, or INCOME, or decrease in ASSETS.
    
    AVAILABLE ACCOUNTS: [${accountContext}].
    
    Return ONLY a JSON object with 'debitAccount' and 'creditAccount' keys containing the exact account IDs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            debitAccount: { type: Type.STRING },
            creditAccount: { type: Type.STRING }
          },
          required: ["debitAccount", "creditAccount"]
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
