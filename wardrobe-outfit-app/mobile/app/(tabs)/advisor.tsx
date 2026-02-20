/**
 * Outfit Advisor Screen — select an occasion and get Claude-powered outfit recommendations.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { getWardrobe, getWardrobeItem } from '../../services/storage';
import { getOutfitRecommendation } from '../../services/api';
import { WardrobeItem, OutfitRecommendation, OCCASIONS } from '../../types';

const { width } = Dimensions.get('window');

export default function AdvisorScreen() {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [customContext, setCustomContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null);
  const [outfitItems, setOutfitItems] = useState<Record<string, WardrobeItem | undefined>>({});

  useFocusEffect(
    useCallback(() => {
      getWardrobe().then(setWardrobe);
      setRecommendation(null);
    }, []),
  );

  const handleGetRecommendation = useCallback(async () => {
    if (!selectedOccasion) {
      Alert.alert('Select an occasion', 'Please choose an occasion first.');
      return;
    }

    if (wardrobe.length === 0) {
      Alert.alert(
        'Empty wardrobe',
        'Add some clothing items to your wardrobe first!',
      );
      return;
    }

    setLoading(true);
    setRecommendation(null);

    try {
      const result = await getOutfitRecommendation(wardrobe, selectedOccasion, customContext || undefined);
      setRecommendation(result);

      // Pre-load item images for recommended outfits
      const itemIds = result.outfits.flatMap(o => o.items);
      const uniqueIds = [...new Set(itemIds)];
      const itemMap: Record<string, WardrobeItem | undefined> = {};
      await Promise.all(
        uniqueIds.map(async id => {
          // Match by partial ID (backend returns Item N [ID: xxx])
          const item = wardrobe.find(w => w.id === id || id.includes(w.id));
          itemMap[id] = item;
        }),
      );
      setOutfitItems(itemMap);
    } catch (err) {
      Alert.alert('Error', 'Failed to get outfit recommendation. Check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedOccasion, wardrobe, customContext]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What's the occasion?</Text>
        <Text style={styles.headerSub}>
          {wardrobe.length} item{wardrobe.length !== 1 ? 's' : ''} in your wardrobe
        </Text>
      </View>

      {/* Occasion Grid */}
      <View style={styles.occasionGrid}>
        {OCCASIONS.map(occ => (
          <TouchableOpacity
            key={occ}
            style={[
              styles.occasionChip,
              selectedOccasion === occ && styles.occasionChipActive,
            ]}
            onPress={() => {
              setSelectedOccasion(occ === selectedOccasion ? null : occ);
              setRecommendation(null);
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.occasionChipText,
                selectedOccasion === occ && styles.occasionChipTextActive,
              ]}
            >
              {occasionEmoji(occ)} {occ}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Optional context */}
      <View style={styles.contextContainer}>
        <Text style={styles.contextLabel}>Additional details (optional)</Text>
        <TextInput
          style={styles.contextInput}
          placeholder="e.g. outdoor, evening event, hot weather..."
          placeholderTextColor="#444"
          value={customContext}
          onChangeText={setCustomContext}
          multiline
          maxLength={200}
        />
      </View>

      {/* Get Recommendation Button */}
      <TouchableOpacity
        style={[styles.button, (!selectedOccasion || loading) && styles.buttonDisabled]}
        onPress={handleGetRecommendation}
        disabled={!selectedOccasion || loading}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator color="#000" size="small" />
        ) : (
          <>
            <Ionicons name="sparkles" size={18} color="#000" />
            <Text style={styles.buttonText}>Style Me</Text>
          </>
        )}
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingHint}>
          <Text style={styles.loadingHintText}>
            Claude is reviewing your wardrobe...
          </Text>
        </View>
      )}

      {/* Recommendations */}
      {recommendation && (
        <View style={styles.recommendationContainer}>
          <Text style={styles.recHeading}>
            Outfits for {recommendation.occasion}
          </Text>

          {recommendation.outfits.length === 0 ? (
            <View style={styles.noOutfits}>
              <Ionicons name="sad-outline" size={40} color="#444" />
              <Text style={styles.noOutfitsText}>
                Not enough matching items for this occasion yet.
              </Text>
            </View>
          ) : (
            recommendation.outfits.map((outfit, i) => (
              <OutfitCard
                key={i}
                outfit={outfit}
                index={i}
                wardrobe={wardrobe}
              />
            ))
          )}

          {/* General Advice */}
          <View style={styles.adviceBox}>
            <View style={styles.adviceHeader}>
              <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
              <Text style={styles.adviceLabel}>Stylist's Advice</Text>
            </View>
            <Text style={styles.adviceText}>{recommendation.generalAdvice}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function OutfitCard({
  outfit,
  index,
  wardrobe,
}: {
  outfit: OutfitRecommendation['outfits'][0];
  index: number;
  wardrobe: WardrobeItem[];
}) {
  // Find matching items from wardrobe based on position references
  const matchedItems = wardrobe.filter((_, i) =>
    outfit.items.some(ref => ref.includes(`${i + 1}`)),
  ).slice(0, 4);

  const colors = ['#3B82F6', '#8B5CF6', '#F59E0B'];
  const color = colors[index % colors.length];

  return (
    <View style={styles.outfitCard}>
      <View style={[styles.outfitNumberBadge, { backgroundColor: color }]}>
        <Text style={styles.outfitNumber}>{index + 1}</Text>
      </View>

      <Text style={styles.outfitName}>{outfit.name}</Text>

      {/* Item thumbnails */}
      {matchedItems.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbScroll}
          contentContainerStyle={styles.thumbRow}
        >
          {matchedItems.map((item, j) => (
            <View key={j} style={styles.thumbContainer}>
              <Image source={{ uri: item.imageUri }} style={styles.thumb} />
              <Text style={styles.thumbLabel} numberOfLines={1}>
                {item.analysis.type}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <Text style={styles.outfitDescription}>{outfit.description}</Text>

      <View style={styles.tipBox}>
        <Ionicons name="information-circle-outline" size={15} color="#10B981" />
        <Text style={styles.tipText}>{outfit.tips}</Text>
      </View>
    </View>
  );
}

function occasionEmoji(occasion: string): string {
  const map: Record<string, string> = {
    'Job Interview': '💼',
    'First Date': '❤️',
    'Casual Friday': '😎',
    'Wedding Guest': '💍',
    'Beach Day': '🏖️',
    'Business Meeting': '🤝',
    'Night Out': '🎉',
    'Gym / Workout': '💪',
    'Weekend Brunch': '☕',
    'Outdoor Adventure': '🏕️',
  };
  return map[occasion] || '👔';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 20, paddingBottom: 60 },

  header: { marginBottom: 24 },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  headerSub: { color: '#555', fontSize: 14, marginTop: 4 },

  occasionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  occasionChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  occasionChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  occasionChipText: { color: '#888', fontSize: 13, fontWeight: '600' },
  occasionChipTextActive: { color: '#000' },

  contextContainer: { marginBottom: 24 },
  contextLabel: { color: '#666', fontSize: 13, marginBottom: 8 },
  contextInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    color: '#FFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    minHeight: 60,
  },

  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: '#000', fontSize: 17, fontWeight: '800' },

  loadingHint: { alignItems: 'center', marginBottom: 16 },
  loadingHintText: { color: '#444', fontSize: 13 },

  recommendationContainer: { marginTop: 8 },
  recHeading: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 16 },

  noOutfits: { alignItems: 'center', padding: 32 },
  noOutfitsText: { color: '#555', fontSize: 14, textAlign: 'center', marginTop: 12 },

  outfitCard: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  outfitNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  outfitNumber: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  outfitName: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 14 },

  thumbScroll: { marginBottom: 14 },
  thumbRow: { gap: 10 },
  thumbContainer: { alignItems: 'center', width: 72 },
  thumb: { width: 72, height: 90, borderRadius: 10, backgroundColor: '#1A1A1A' },
  thumbLabel: { color: '#666', fontSize: 10, marginTop: 4, textAlign: 'center' },

  outfitDescription: { color: '#AAA', fontSize: 14, lineHeight: 22, marginBottom: 12 },

  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0D1F19',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  tipText: { color: '#10B981', fontSize: 13, flex: 1, lineHeight: 20 },

  adviceBox: {
    backgroundColor: '#1A1500',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2A2200',
  },
  adviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  adviceLabel: { color: '#F59E0B', fontSize: 14, fontWeight: '700' },
  adviceText: { color: '#D4A017', fontSize: 14, lineHeight: 22 },
});
