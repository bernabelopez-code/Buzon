
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeCase(description: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiza la siguiente denuncia laboral y proporciona un resumen ejecutivo, una clasificación de severidad (Baja, Media, Alta, Crítica) y 3 pasos recomendados para el departamento de Recursos Humanos. 
      
      Denuncia: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumen: { type: Type.STRING },
            severidad: { type: Type.STRING },
            pasos: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["resumen", "severidad", "pasos"]
        }
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
}
