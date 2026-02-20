/**
 * API client for communicating with the backend.
 * Set EXPO_PUBLIC_API_URL in your .env file, e.g. http://localhost:3000
 */
import { ClothingAnalysis, OutfitRecommendation, WardrobeItem } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export async function analyzeClothing(
  imageBase64: string,
  mediaType: string = 'image/jpeg',
): Promise<ClothingAnalysis> {
  const response = await fetch(`${API_URL}/api/wardrobe/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mediaType }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Failed to analyze clothing');
  }

  const data = await response.json() as { success: boolean; analysis: ClothingAnalysis };
  return data.analysis;
}

export async function getOutfitRecommendation(
  wardrobe: WardrobeItem[],
  occasion: string,
  context?: string,
): Promise<OutfitRecommendation> {
  // Strip imageBase64 from items to reduce payload size — backend only needs analysis + id
  const lightWardrobe = wardrobe.map(({ id, analysis, addedAt }) => ({
    id,
    imageBase64: '',
    analysis,
    addedAt,
  }));

  const response = await fetch(`${API_URL}/api/advisor/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wardrobe: lightWardrobe, occasion, context }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Failed to get recommendation');
  }

  const data = await response.json() as { success: boolean; recommendation: OutfitRecommendation };
  return data.recommendation;
}
