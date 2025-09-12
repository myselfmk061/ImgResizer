
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
    if (input.width <= 0 || input.height <= 0) {
      return { estimatedFileSizeKB: 0 };
    }
    const result = await estimateFileSize(input);
    return result;
  } catch (error) {
    console.error('Error estimating file size:', error);
    return { error: 'Failed to estimate file size.' };
  }
}
