import { GoogleGenAI, Type } from "@google/genai";
import { BlockData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBentoLayout = async (persona: string, themeContext: string = "Neutral"): Promise<BlockData[]> => {
  try {
    const model = "gemini-2.5-flash";
    
    const response = await ai.models.generateContent({
      model: model,
      contents: `Generate a JSON list of 6 to 8 bento grid blocks for a personal website. 
      
      User Persona/Vibe: "${persona}".
      Visual Theme Context: "${themeContext}".
      
      Instructions:
      1. Content Tone: Match the writing style to the Persona and the Visual Theme. (e.g., if the theme is 'Dark Red/Crimson', make the text edgier or bolder. If 'Pastel', make it softer/playful).
      2. Block Types: strictly use 'social', 'image', 'text', 'map', 'profile'.
      3. Block Sizes: strictly use '1x1', '2x1', '2x2', '1x2'.
      4. Images: For 'imageUrl', use 'https://source.unsplash.com/random/800x800?[keywords]' where [keywords] matches the persona AND the theme color palette.
      5. Icons: Use valid Lucide React icon names (lowercase).
      6. Profile: Ensure exactly ONE 'profile' block exists.
      
      Schema:
      Return ONLY a JSON array.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              size: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              url: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              iconName: { type: Type.STRING },
              status: { type: Type.STRING, description: "Short status for profile block" }
            },
            required: ["type", "size", "title"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    // Strip markdown if present to prevent parse errors
    const jsonString = text.replace(/```json\n?|```/g, '').trim();

    const blocks = JSON.parse(jsonString);
    
    // Hydrate with IDs and ensure data integrity
    return blocks.map((b: any) => ({
      ...b,
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: b.type === 'image' || b.type === 'profile' 
        ? b.imageUrl || `https://picsum.photos/seed/${Math.random()}/600/600` 
        : undefined
    }));

  } catch (error) {
    console.error("AI Generation failed:", error);
    return [];
  }
};