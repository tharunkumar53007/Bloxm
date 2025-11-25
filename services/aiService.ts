
import { GoogleGenAI, Type } from "@google/genai";
import { BlockData } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to generate a consistent ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateBentoLayout = async (persona: string, themeContext: string = "Neutral"): Promise<BlockData[]> => {
  try {
    if (!apiKey) {
      console.error("API Key missing for AI Service");
      throw new Error("API Key missing");
    }

    const model = "gemini-2.5-flash";
    
    // Concatenated string to avoid any potential multiline string literal issues in certain environments
    const systemPrompt = 
      "You are an expert UI/UX designer and creative director.\n" +
      "Your task is to generate a JSON content structure for a 'Bento Grid' personal website based on a User Persona.\n\n" +
      
      "Context:\n" +
      "- User Persona: " + persona + "\n" +
      "- Visual Theme: " + themeContext + "\n\n" +

      "Rules:\n" +
      "1. Generate 7 to 10 blocks.\n" +
      "2. **Variety is key**: Use a mix of 'text', 'social', 'image', 'map', and exactly ONE 'profile'.\n" +
      "3. **Sizes**: Use '1x1' (small square), '2x1' (wide), '1x2' (tall), '2x2' (large square). Do not use other sizes.\n" +
      "4. **Content**: Write short, punchy, professional, or witty content matching the persona.\n" +
      "5. **Images**: For 'image' and 'profile' blocks, provide a concise, descriptive English prompt in the 'imagePrompt' field (e.g., 'cyberpunk neon city rain', 'minimalist white desk plant', 'anime character portrait').\n" +
      "6. **Icons**: Use valid Lucide React icon names in lowercase (e.g., 'twitter', 'github', 'mail', 'map-pin', 'camera', 'code', 'music').\n\n" +
      
      "Output Schema (JSON Only):\n" +
      "Return an Array of Objects.";

    const response = await ai.models.generateContent({
      model: model,
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['social', 'image', 'text', 'map', 'profile'] },
              size: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              url: { type: Type.STRING },
              imagePrompt: { type: Type.STRING, description: "A visual description for AI image generation" },
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

    // Robust JSON Parsing: Strip markdown code blocks if present
    const cleanJson = text.replace(/```json\n?|```/g, '').trim();
    const rawBlocks = JSON.parse(cleanJson);
    
    // Hydrate blocks with functional logic
    const hydratedBlocks: BlockData[] = rawBlocks.map((b: any) => {
      let imageUrl = undefined;
      let finalUrl = b.url;

      // Generate Context-Aware Image URL using Pollinations.ai (Free, fast, no-auth)
      if ((b.type === 'image' || b.type === 'profile') && b.imagePrompt) {
        const encodedPrompt = encodeURIComponent(b.imagePrompt);
        // Add random seed to prevent caching issues between generations
        const seed = Math.floor(Math.random() * 1000); 
        imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&seed=${seed}&model=flux`;
      } 
      // Fallback for missing images in image types
      else if (b.type === 'image' && !imageUrl) {
        imageUrl = `https://picsum.photos/seed/${generateId()}/800/800`;
      }

      // Default URL for socials if missing
      if (b.type === 'social' && !finalUrl) {
         if (b.iconName === 'twitter') finalUrl = 'https://twitter.com';
         else if (b.iconName === 'github') finalUrl = 'https://github.com';
         else if (b.iconName === 'instagram') finalUrl = 'https://instagram.com';
         else finalUrl = '#';
      }

      return {
        id: generateId(),
        type: b.type,
        size: b.size || '1x1',
        title: b.title,
        content: b.content,
        url: finalUrl,
        imageUrl: imageUrl,
        iconName: b.iconName,
        status: b.status,
        lastUpdated: Date.now()
      };
    });

    return hydratedBlocks;

  } catch (error) {
    console.error("AI Generation failed:", error);
    // Return a fallback block so the app doesn't crash, but user knows it failed
    return [{
        id: generateId(),
        type: 'text',
        size: '2x1',
        title: 'Generation Error',
        content: "We couldn't reach the AI brain. Please check your connection or API key.",
        lastUpdated: Date.now()
    }];
  }
};
