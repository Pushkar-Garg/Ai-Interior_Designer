import { GoogleGenAI } from "@google/genai";

export const INTERIOR_STYLES = [
  { id: 'modern', name: 'Modern Minimalist', prompt: 'modern minimalist interior, clean lines, neutral colors, high-end furniture, spacious' },
  { id: 'scandinavian', name: 'Scandinavian', prompt: 'scandinavian style, light wood, cozy textures, functional, bright and airy' },
  { id: 'industrial', name: 'Industrial', prompt: 'industrial loft style, exposed brick, metal accents, dark wood, raw textures' },
  { id: 'luxury', name: 'Luxury', prompt: 'high-end luxury interior, gold accents, marble surfaces, velvet textures, opulent lighting' },
  { id: 'boho', name: 'Bohemian', prompt: 'bohemian style, eclectic patterns, plants, warm colors, relaxed and artistic' },
  { id: 'midcentury', name: 'Mid-Century Modern', prompt: 'mid-century modern, organic shapes, tapered legs, wood paneling, retro-modern' },
  { id: 'japandi', name: 'Japandi', prompt: 'japandi style, fusion of japanese and scandinavian, zen, natural materials, minimalist' },
];

export async function generateInteriorDesign(imageBase64, userPrompt, styleId) {
  console.log('Starting interior design generation...', { styleId, promptLength: userPrompt.length });
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in the Secrets panel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const style = INTERIOR_STYLES.find(s => s.id === styleId) || INTERIOR_STYLES[0];
  
  const fullPrompt = `Redesign this interior space. 
  Style: ${style.name}. 
  User Description: ${userPrompt}. 
  Requirements: Maintain the basic structure and layout of the room but completely transform the furniture, wall colors, textures, and lighting to match the requested style. 
  Style details: ${style.prompt}. 
  Output should be a high-quality, photorealistic interior design visualization.`;

  // Detect mimeType from base64 string
  const mimeTypeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    console.log('Gemini response received:', response);

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      throw new Error("Invalid response structure from Gemini API");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        console.log('Image generated successfully');
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("The model did not return an image. It might have returned text instead: " + (candidate.content.parts[0]?.text || "No text either"));
  } catch (error) {
    console.error('Error in generateInteriorDesign:', error);
    throw error;
  }
}
