'use server';

/**
 * @fileOverview This file defines a Genkit flow for enhancing an image using AI.
 *
 * - enhanceImage - A function that takes an image data URI and an enhancement type, returning the enhanced image.
 * - EnhanceImageInput - The input type for the enhanceImage function.
 * - EnhanceImageOutput - The return type for the enhanceImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "The source image to enhance, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  enhancementType: z.string().describe("The type of enhancement to apply, e.g., 'sharpen'."),
});
export type EnhanceImageInput = z.infer<typeof EnhanceImageInputSchema>;

const EnhanceImageOutputSchema = z.object({
  enhancedPhotoDataUri: z.string().describe('The resulting enhanced image as a data URI.'),
});
export type EnhanceImageOutput = z.infer<typeof EnhanceImageOutputSchema>;


export async function enhanceImage(input: EnhanceImageInput): Promise<EnhanceImageOutput> {
  return enhanceImageFlow(input);
}

const enhanceImageFlow = ai.defineFlow(
  {
    name: 'enhanceImageFlow',
    inputSchema: EnhanceImageInputSchema,
    outputSchema: EnhanceImageOutputSchema,
  },
  async (input) => {
    let enhancementPrompt = `Please don't add any text to your response. Apply a professional '${input.enhancementType}' effect to this image to improve its quality, clarity, and detail.`;

    if (input.enhancementType.toLowerCase() === 'sharpen') {
        enhancementPrompt = `You are an expert photo restoration specialist. A user has provided a blurry image and wants it to be 'much more and more clear'. Your task is to apply an advanced, professional-grade sharpening and deblurring process. Increase the clarity, remove motion blur and compression artifacts, and enhance fine details to their maximum possible level without introducing unnatural artifacts. The final result should be exceptionally crisp and clear. Do not add any text to your response.`;
    }

    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { media: { url: input.photoDataUri } },
            { text: enhancementPrompt },
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media?.url) {
        throw new Error('Image generation failed to return a valid image.');
    }

    return { enhancedPhotoDataUri: media.url };
  }
);
