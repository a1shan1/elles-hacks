import { GoogleGenAI, Tool } from "@google/genai";
import { GeminiResult, SearchParams } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const searchPlaces = async (
  params: SearchParams, 
  userLocation?: { lat: number; lng: number }
): Promise<GeminiResult> => {
  
  const { query, vibe, category, radius } = params;

  const tools: Tool[] = [{ googleMaps: {} }];
  
  let toolConfig = undefined;
  if (userLocation) {
    toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: userLocation.lat,
          longitude: userLocation.lng
        }
      }
    };
  }

  const locationContext = userLocation 
    ? `near my current location (lat: ${userLocation.lat}, lng: ${userLocation.lng}) within a ${radius} radius`
    : `in the Greater Toronto Area (GTA) within a ${radius} range of downtown`;

  const prompt = `
    I am a university student in the GTA.
    Find me a compilation of places that match these criteria:
    - What: ${category}
    - Vibe: ${vibe}
    - Radius/Location: ${locationContext}
    - Specific preferences: ${query}
    
    Find exactly 4-6 specific, real locations.
    
    For each location provide:
    1. Name
    2. Exact Address
    3. A short, punchy description (max 2 sentences) describing why it fits the vibe for students.
    4. 2-3 short tags (e.g. "Free Wifi", "Cheap Eats", "Quiet").
    5. Accurate coordinates.

    CRITICAL: Return the response primarily as a JSON block at the end. The text before it should be a very brief (1 sentence) summary like "Here are some great spots near you:".

    The JSON structure must be:
    \`\`\`json
    [
      {
        "name": "Location Name",
        "lat": 43.123,
        "lng": -79.123,
        "description": "Short summary",
        "address": "Street Address",
        "tags": ["Tag1", "Tag2"]
      }
    ]
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools,
        toolConfig,
        systemInstruction: "You are a helpful local directory engine for students. Prioritize accuracy and finding real locations. Do not be chatty. Just return the data."
      }
    });

    const text = response.text || "No results found.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as any;

    return {
      text,
      groundingChunks
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Error searching places. Please try again.",
    };
  }
};
