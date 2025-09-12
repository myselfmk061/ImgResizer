'use server';

import {
  estimateFileSize,
  EstimateFileSizeInput,
  EstimateFileSizeOutput,
} from '@/ai/flows/estimate-file-size';

// Simple mathematical estimation as fallback
function calculateFileSizeEstimate(width: number, height: number, quality: string): EstimateFileSizeOutput {
  const pixels = width * height;
  
  // Base compression ratios for different qualities
  const compressionRatios = {
    low: 0.1,    // Heavy compression
    medium: 0.25, // Balanced compression  
    high: 0.5     // Light compression
  };
  
  const ratio = compressionRatios[quality as keyof typeof compressionRatios] || 0.25;
  
  // Estimate: pixels * 3 bytes (RGB) * compression ratio / 1024 (KB)
  const estimatedFileSizeKB = Math.round((pixels * 3 * ratio) / 1024);
  
  return {
    estimatedFileSizeKB,
    reasoning: `Estimated based on ${width}x${height} pixels with ${quality} quality compression.`
  };
}

export async function getEstimatedFileSize(
  input: EstimateFileSizeInput
): Promise<EstimateFileSizeOutput | { error: string }> {
  try {
    if (input.width <= 0 || input.height <= 0 || !input.quality) {
      return { estimatedFileSizeKB: 0, reasoning: 'Invalid dimensions provided.' };
    }
    
    // Try AI estimation first, fallback to mathematical estimation
    try {
      const result = await estimateFileSize(input);
      return result;
    } catch (aiError) {
      console.warn('AI estimation failed, using mathematical fallback:', aiError);
      return calculateFileSizeEstimate(input.width, input.height, input.quality);
    }
  } catch (error: any) {
    console.error('Error estimating file size:', error);
    // Final fallback to mathematical estimation
    return calculateFileSizeEstimate(input.width, input.height, input.quality);
  }
}
