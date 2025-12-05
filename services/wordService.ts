import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWords = async (themePrompt: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of 40 distinct, single-word English terms related to: "${themePrompt}". 
      Words should range from 3 to 12 letters. 
      Avoid hyphens or special characters. 
      Return purely the array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    const text = response.text;
    if (!text) return ["error", "loading", "failed"];

    const words = JSON.parse(text) as string[];
    // Filter to ensure basic text only just in case
    return words.filter(w => /^[a-zA-Z]+$/.test(w)).map(w => w.toLowerCase());
  } catch (error) {
    console.error("Failed to generate words:", error);
    // Fallback list if API fails
    return ["connection", "failed", "retry", "gemini", "offline", "typing", "game", "minimal", "react", "code"];
  }
};