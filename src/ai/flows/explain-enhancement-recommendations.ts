'use server';

/**
 * @fileOverview Explains why a specific image enhancement method is recommended for a given image.
 *
 * - explainEnhancementRecommendation - A function that explains the recommendation for an enhancement method.
 * - ExplainEnhancementRecommendationInput - The input type for the explainEnhancementRecommendation function.
 * - ExplainEnhancementRecommendationOutput - The return type for the explainEnhancementRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainEnhancementRecommendationInputSchema = z.object({
  imageDescription: z
    .string()
    .describe('A detailed description of the image, including its characteristics and any apparent issues.'),
  enhancementMethod: z
    .string()
    .describe('The name of the image enhancement method being recommended.'),
});
export type ExplainEnhancementRecommendationInput = z.infer<
  typeof ExplainEnhancementRecommendationInputSchema
>;

const ExplainEnhancementRecommendationOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A detailed explanation of why the enhancement method is recommended for the given image, including the specific image characteristics it addresses.'
    ),
});
export type ExplainEnhancementRecommendationOutput = z.infer<
  typeof ExplainEnhancementRecommendationOutputSchema
>;

export async function explainEnhancementRecommendation(
  input: ExplainEnhancementRecommendationInput
): Promise<ExplainEnhancementRecommendationOutput> {
  return explainEnhancementRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainEnhancementRecommendationPrompt',
  input: {schema: ExplainEnhancementRecommendationInputSchema},
  output: {schema: ExplainEnhancementRecommendationOutputSchema},
  prompt: `You are an expert image processing specialist. A user has uploaded an image with the following description: "{{imageDescription}}". You have recommended the "{{enhancementMethod}}" enhancement method. Explain why this method is particularly well-suited for this image, focusing on the specific characteristics of the image that make this method effective. Provide a detailed explanation so the user can understand your reasoning. `,
});

const explainEnhancementRecommendationFlow = ai.defineFlow(
  {
    name: 'explainEnhancementRecommendationFlow',
    inputSchema: ExplainEnhancementRecommendationInputSchema,
    outputSchema: ExplainEnhancementRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
