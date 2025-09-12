'use server';

import {
  estimateFileSize,
  EstimateFileSizeInput,
  EstimateFileSizeOutput,
} from '@/ai/flows/estimate-file-size';

export async function getEstimatedFileSize(
  input: EstimateFileSizeInput
): Promise<EstimateFileSizeOutput | { error: string }> {
  try {
    if (input.width <= 0 || input.height <= 0 || !input.quality) {
      return { estimatedFileSizeKB: 0, reasoning: 'Invalid dimensions provided.' };
    }
    const result = await estimateFileSize(input);
    return result;
  } catch (error: any) {
    console.error('Error estimating file size:', error);
    return { error: `Failed to estimate file size: ${error.message}` };
  }
}
