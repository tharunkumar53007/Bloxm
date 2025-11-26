
import { GoogleGenAI, Type } from "@google/genai";
import { BlockData } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to generate a consistent ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Fallback Templates (Guarantees a result if AI fails/times out) ---
const getFallbackLayout = (vibe: string): BlockData[] => {
    const timestamp = Date.now();
    const baseItems: BlockData[] = [
        {
            id: generateId(),
            type: 'profile',
            size: '2x2',
            title: 'Welcome to My World',
            content: "I'm a digital creator passionate about building aesthetic web experiences. This space reflects my journey and work.",
            status: 'Online',
            imageUrl: `https://picsum.photos/seed/${generateId()}/800/800`,
            lastUpdated: timestamp
        },
        {
            id: generateId(),
            type: 'social',
            size: '1x1',
            title: 'Twitter / X',
            iconName: 'twitter',
            url: 'https://twitter.com',
            lastUpdated: timestamp
        },
        {
            id: generateId(),
            type: 'social',
            size: '1x1',
            title: 'Instagram',
            iconName: 'instagram',
            url: 'https://instagram.com',
            lastUpdated: timestamp
        },
        {
            id: generateId(),
            type: 'text',
            size: '2x1',
            title: 'About Me',
            content: "I specialize in UI/UX design and frontend development. I love turning complex problems into simple, beautiful solutions.",
            lastUpdated: timestamp
        },
        {
            id: generateId(),
            type: 'image',
            size: '1x1',
            title: 'Inspiration',
            content: 'Visual vibes',
            imageUrl: `https://picsum.photos/seed/${generateId()}_art/800/800`,
            lastUpdated: timestamp
        }
    ];

    // Vibe-specific tweaks
    if (vibe === 'cyberpunk') {
        baseItems[0].title = "NEURAL LINK ESTABLISHED";
        baseItems[0].content = "Hacking the gibson. Digital nomad traversing the neon grid.";
        baseItems[3].title = "System Status";
        baseItems[3].content = "Running optimal. 99% uptime. Ready to deploy.";
    } else if (vibe === 'minimalist') {
        baseItems[0].title = "Hello.";
        baseItems[0].content = "Less is more. A collection of my essential work.";
        baseItems[3].title = "Focus";
        baseItems[3].content = "Simplicity, clarity, and purpose.";
    } else if (vibe === 'creative') {
        baseItems[0].title = "Canvas";
        baseItems[0].content = "Painting with pixels. Exploring the intersection of art and code.";
        baseItems[3].title = "My Muse";
        baseItems[3].content = "Nature, architecture, and soundscapes inspire my daily work.";
    }

    return baseItems;
};

export const generateBentoLayout = async (
    persona: string, 
    themeContext: string = "Neutral", 
    vibe: string = "professional"
): Promise<BlockData[]> => {
  try {
    // 1. Timeout Promise (12 seconds max wait time)
    const timeoutPromise = new Promise<BlockData[]>((_, reject) => {
        setTimeout(() => reject(new Error("AI_TIMEOUT")), 12000);
    });

    // 2. AI Generation Promise
    const aiPromise = (async () => {
        if (!apiKey) throw new Error("NO_API_KEY");

        const model = "gemini-2.5-flash";
        const systemPrompt = 
          `Role: Award-winning UI/UX Designer.
           Task: Create a JSON array of 8-10 'Bento Grid' blocks for a personal website.
           
           Context:
           - User Persona: ${persona}
           - Visual Theme: ${themeContext}
           - Vibe: ${vibe} (IMPORTANT: Match tone of voice and content to this vibe)

           Block Types Allowed: 'profile' (max 1), 'social', 'text', 'image', 'map', 'list'.
           
           Rules:
           1. 'profile' block MUST be included. Size '2x2' or '2x1'.
           2. Use varied sizes ('1x1', '2x1', '1x2', '2x2') for a jagged grid.
           3. 'imagePrompt' field is required for 'image' and 'profile' blocks (detailed English description).
           4. 'content' should be creative and specific to the persona.
           5. Output strictly valid JSON array. No markdown.
           `;

        const response = await ai.models.generateContent({
          model: model,
          contents: systemPrompt,
          config: {
            temperature: 0.8,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['social', 'image', 'text', 'map', 'profile', 'list'] },
                  size: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  url: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING },
                  iconName: { type: Type.STRING },
                  status: { type: Type.STRING },
                  items: { type: Type.ARRAY, items: { type: Type.STRING } },
                  listType: { type: Type.STRING }
                },
                required: ["type", "size", "title"]
              }
            }
          }
        });

        const text = response.text;
        if (!text) throw new Error("EMPTY_RESPONSE");
        
        const cleanJson = text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleanJson);
    })();

    // 3. Race!
    const rawBlocks: any[] = await Promise.race([aiPromise, timeoutPromise]) as any[];
    
    // 4. Hydrate Blocks (Images, IDs)
    const hydratedBlocks: BlockData[] = rawBlocks.map((b: any) => {
      let imageUrl = undefined;
      let finalUrl = b.url;

      // Enhance Image Generation
      if ((b.type === 'image' || b.type === 'profile') && b.imagePrompt) {
        const styleSuffix = vibe === 'cyberpunk' ? 'neon, cinematic lighting, futuristic, high contrast' : 
                           vibe === 'minimalist' ? 'minimal, clean lines, bright, soft shadows' :
                           vibe === 'creative' ? 'artistic, colorful, abstract, oil painting style' : 
                           'professional, photorealistic, 4k, studio lighting';
                           
        const encodedPrompt = encodeURIComponent(`${b.imagePrompt}, ${styleSuffix}`);
        const seed = Math.floor(Math.random() * 99999); 
        imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&seed=${seed}&model=flux`;
      } 
      else if (b.type === 'image' && !imageUrl) {
        imageUrl = `https://picsum.photos/seed/${generateId()}/800/800`;
      }

      // Default URL fallbacks
      if (b.type === 'social' && !finalUrl) {
         if (b.iconName === 'twitter') finalUrl = 'https://twitter.com';
         else if (b.iconName === 'github') finalUrl = 'https://github.com';
         else if (b.iconName === 'linkedin') finalUrl = 'https://linkedin.com';
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
        lastUpdated: Date.now(),
        items: b.items,
        listType: b.listType
      };
    });

    return hydratedBlocks;

  } catch (error) {
    console.warn("AI Generation fallback triggered:", error);
    // Graceful Degradation: Return a local template so the user NEVER sees an error.
    return getFallbackLayout(vibe);
  }
};
