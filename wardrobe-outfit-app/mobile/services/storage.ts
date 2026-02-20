/**
 * Local storage service using AsyncStorage-compatible approach.
 * Wardrobe items are persisted on device between app sessions.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WardrobeItem } from '../types';

const WARDROBE_KEY = '@wardrobe_items';

export async function getWardrobe(): Promise<WardrobeItem[]> {
  try {
    const json = await AsyncStorage.getItem(WARDROBE_KEY);
    if (!json) return [];
    return JSON.parse(json) as WardrobeItem[];
  } catch {
    return [];
  }
}

export async function addWardrobeItem(item: WardrobeItem): Promise<void> {
  const items = await getWardrobe();
  items.unshift(item); // newest first
  await AsyncStorage.setItem(WARDROBE_KEY, JSON.stringify(items));
}

export async function removeWardrobeItem(id: string): Promise<void> {
  const items = await getWardrobe();
  const filtered = items.filter(i => i.id !== id);
  await AsyncStorage.setItem(WARDROBE_KEY, JSON.stringify(filtered));
}

export async function getWardrobeItem(id: string): Promise<WardrobeItem | undefined> {
  const items = await getWardrobe();
  return items.find(i => i.id === id);
}
