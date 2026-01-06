import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageSize } from "../types";

// Helper to get a fresh client instance with the latest key
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateProductImage = async (
  prompt: string,
  size: ImageSize
): Promise<string> => {
  const ai = getAiClient();
  
  // Using gemini-3-pro-image-preview for high quality generation
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: "1:1" // Square is best for general mockups
      }
    }
  });

  // Extract image from response
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image generated.");
};

export const editMockupImage = async (
  imageBase64: string, // Full base64 string including data:image/...
  prompt: string
): Promise<string> => {
  const ai = getAiClient();
  
  // Remove header if present for sending to API
  const base64Data = imageBase64.split(',')[1];
  const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));

  // Using gemini-2.5-flash-image (Nano Banana) for editing
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        },
        { text: prompt }
      ]
    }
  });

  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("No edited image returned.");
};
