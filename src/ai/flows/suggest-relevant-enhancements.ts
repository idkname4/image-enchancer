'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests relevant image enhancement methods based on the uploaded image.
 *
 * - suggestRelevantEnhancements - A function that takes an image data URI and returns a list of suggested enhancement methods.
 * - SuggestRelevantEnhancementsInput - The input type for the suggestRelevantEnhancements function.
 * - SuggestRelevantEnhancementsOutput - The return type for the suggestRelevantEnhancements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantEnhancementsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestRelevantEnhancementsInput = z.infer<typeof SuggestRelevantEnhancementsInputSchema>;

const SuggestRelevantEnhancementsOutputSchema = z.object({
  suggestedEnhancements: z
    .array(z.string())
    .describe('A list of suggested image enhancement methods.'),
});
export type SuggestRelevantEnhancementsOutput = z.infer<typeof SuggestRelevantEnhancementsOutputSchema>;

export async function suggestRelevantEnhancements(
  input: SuggestRelevantEnhancementsInput
): Promise<SuggestRelevantEnhancementsOutput> {
  return suggestRelevantEnhancementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantEnhancementsPrompt',
  input: {schema: SuggestRelevantEnhancementsInputSchema},
  output: {schema: SuggestRelevantEnhancementsOutputSchema},
  prompt: `You are an expert image enhancement advisor. Analyze the provided image and suggest the most relevant enhancement methods from the following list: Grayscale, Low-pass, Gamma Correction, Histogram Equalization.

  Return a list of the names of the methods that are most relevant to improving the image quality.  Only return methods from the provided list.

  Image: {{media url=photoDataUri}}`,
});

const suggestRelevantEnhancementsFlow = ai.defineFlow(
  {
    name: 'suggestRelevantEnhancementsFlow',
    inputSchema: SuggestRelevantEnhancementsInputSchema,
    outputSchema: SuggestRelevantEnhancementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
