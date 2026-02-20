export interface ClothingAnalysis {
  type: string;
  category: 'top' | 'bottom' | 'outerwear' | 'footwear' | 'accessory' | 'suit' | 'underwear';
  color: string[];
  pattern: string;
  style: string;
  material: string;
  season: string[];
  description: string;
}

export interface WardrobeItem {
  id: string;
  imageUri: string;         // local file URI on device
  imageBase64?: string;     // used for API calls
  analysis: ClothingAnalysis;
  addedAt: string;          // ISO timestamp
}

export interface OutfitSuggestion {
  name: string;
  items: string[];          // item IDs
  description: string;
  tips: string;
}

export interface OutfitRecommendation {
  occasion: string;
  outfits: OutfitSuggestion[];
  generalAdvice: string;
}

export type CategoryIcon = {
  [key in ClothingAnalysis['category']]: string;
};

export const OCCASIONS = [
  'Job Interview',
  'First Date',
  'Casual Friday',
  'Wedding Guest',
  'Beach Day',
  'Business Meeting',
  'Night Out',
  'Gym / Workout',
  'Weekend Brunch',
  'Outdoor Adventure',
] as const;

export type Occasion = typeof OCCASIONS[number];
