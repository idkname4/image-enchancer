"use server";

import { explainEnhancementRecommendation } from "@/ai/flows/explain-enhancement-recommendations";
import { suggestRelevantEnhancements } from "@/ai/flows/suggest-relevant-enhancements";
import { enhanceImage } from "@/ai/flows/enhance-image";

type AISuggestion = {
  name: string;
  explanation: string;
};

export async function getAISuggestions(
  photoDataUri: string
): Promise<AISuggestion[]> {
  try {
    const suggestionsResult = await suggestRelevantEnhancements({ photoDataUri });

    if (
      !suggestionsResult ||
      !suggestionsResult.suggestedEnhancements ||
      suggestionsResult.suggestedEnhancements.length === 0
    ) {
      return [];
    }

    const explanations = await Promise.all(
      suggestionsResult.suggestedEnhancements.map(async (method) => {
        try {
          const explanationResult = await explainEnhancementRecommendation({
            enhancementMethod: method,
            imageDescription:
              "A user-uploaded photo that might have issues with lighting, contrast, or color balance, for which an enhancement has been recommended.",
          });
          return {
            name: method,
            explanation: explanationResult.explanation,
          };
        } catch (error) {
          console.error(`Error getting explanation for ${method}:`, error);
          // Return a default explanation on error
          return {
            name: method,
            explanation: `AI explanation for ${method} could not be generated at this time.`,
          };
        }
      })
    );

    return explanations;
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    return [];
  }
}

export async function getAISharpenedImage(photoDataUri: string): Promise<string | null> {
  try {
    const result = await enhanceImage({
      photoDataUri,
      enhancementType: "sharpen",
    });
    return result.enhancedPhotoDataUri;
  } catch (error) {
    console.error("Error getting AI sharpened image:", error);
    return null;
  }
}
