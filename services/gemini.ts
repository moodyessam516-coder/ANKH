
import { GoogleGenAI } from "@google/genai";

export const geminiService = {
  enhanceContent: async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) return prompt;
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `قم بتحسين المنشور التالي ليكون أكثر جاذبية واحترافية باللغة العربية، مع الحفاظ على نبرة غامضة أو فرعونية (ANKH) إذا كان ذلك مناسباً. اجعل النص لا يتجاوز 200 حرف: "${prompt}"`,
        config: {
          temperature: 0.7,
        },
      });
      return response.text || prompt;
    } catch (error) {
      console.error("Gemini enhancement failed:", error);
      return prompt;
    }
  },

  generateImage: async (prompt: string): Promise<string | null> => {
    if (!process.env.API_KEY) return null;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `Create a cinematic, high-quality, mystical illustration in an ancient Egyptian futuristic style based on this description (translated to English if needed): ${prompt}. Ensure deep shadows and golden accents.` }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Image generation failed:", error);
      return null;
    }
  },

  generateVideo: async (prompt: string, progressCallback?: (msg: string) => void): Promise<string | null> => {
    if (typeof window.aistudio !== 'undefined' && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      progressCallback?.("بدء طقس التجسيد البصري...");
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `An ancient Egyptian mystical visual: ${prompt}. Cinematic 4k, golden hour, deep shadows, highly detailed.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '9:16'
        }
      });

      let dots = ".";
      while (!operation.done) {
        progressCallback?.(`جاري التجسيد في الفراغ الرقمي${dots}`);
        dots = dots.length > 3 ? "." : dots + ".";
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) return null;

      progressCallback?.("نهائيات السجل الأبدي...");
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Video generation failed:", error);
      return null;
    }
  }
};
