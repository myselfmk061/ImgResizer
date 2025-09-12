'use server';

/**
 * @fileOverview Estimates the file size of a resized image based on the quality setting.
 *
 * - estimateFileSize - A function that estimates the file size.
 * - EstimateFileSizeInput - The input type for the estimateFileSize function.
 * - EstimateFileSizeOutput - The return type for the estimateFileSize function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateFileSizeInputSchema = z.object({
  width: z.number().describe('The width of the resized image in pixels.'),
  height: z.number().describe('The height of the resized image in pixels.'),
  quality: z
    .string()
    .describe(
      'The quality setting for the resized image (e.g., low, medium, high).' + 
      'Consider lower qualities for faster downloads and smaller file sizes, and higher qualities for better clarity and larger file sizes.'
    ),
});

export type EstimateFileSizeInput = z.infer<typeof EstimateFileSizeInputSchema>;

const EstimateFileSizeOutputSchema = z.object({
  estimatedFileSizeKB: z
    .number()
    .describe('The estimated file size of the resized image in kilobytes.'),
});

export type EstimateFileSizeOutput = z.infer<typeof EstimateFileSizeOutputSchema>;

export async function estimateFileSize(
  input: EstimateFileSizeInput
): Promise<EstimateFileSizeOutput> {
  return estimateFileSizeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateFileSizePrompt',
  input: {schema: EstimateFileSizeInputSchema},
  output: {schema: EstimateFileSizeOutputSchema},
  prompt: `You are an expert in image compression and file sizes.

  Based on the width, height, and quality setting provided, estimate the final file size of the resized image in kilobytes.

  Width: {{width}} pixels
  Height: {{height}} pixels
  Quality: {{quality}}

  Consider that "low" quality images are heavily compressed, "medium" quality images have a balance between compression and detail, and "high" quality images have minimal compression.

  Return ONLY a numerical value representing the estimated file size in kilobytes. Do not include units or any other text.
  `,
});

const estimateFileSizeFlow = ai.defineFlow(
  {
    name: 'estimateFileSizeFlow',
    inputSchema: EstimateFileSizeInputSchema,
    outputSchema: EstimateFileSizeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      estimatedFileSizeKB: parseFloat(output!.estimatedFileSizeKB.toString()),
    };
  }
);
