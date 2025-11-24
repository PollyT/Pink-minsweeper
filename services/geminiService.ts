import { GoogleGenAI } from "@google/genai";

export const generateTarotReading = async (cardName: string, keywords: string[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "The mists are too thick to see the future... (API Key missing)";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are a gentle, mystical, and cozy fortune teller. 
      The user has just unlocked the Tarot card: "${cardName}".
      Keywords associated with this card are: ${keywords.join(', ')}.
      
      Please provide a short, warm, and encouraging reading based on this card. 
      Keep it brief (under 50 words) and suitable for a relaxing game atmosphere.
      Focus on the positive aspects or gentle warnings.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "The stars are silent today.";
  } catch (error) {
    console.error("Error generating reading:", error);
    return "The spirits are resting. Please try again later.";
  }
};