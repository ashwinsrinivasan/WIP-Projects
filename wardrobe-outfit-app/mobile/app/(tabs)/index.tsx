/**
 * Wardrobe Screen — upload clothes via camera/gallery, view your wardrobe grid.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { analyzeClothing } from '../../services/api';
import { getWardrobe, addWardrobeItem, removeWardrobeItem } from '../../services/storage';
import { WardrobeItem, ClothingAnalysis } from '../../types';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;

const CATEGORY_COLORS: Record<string, string> = {
  top: '#3B82F6',
  bottom: '#8B5CF6',
  outerwear: '#F59E0B',
  footwear: '#EF4444',
  accessory: '#10B981',
  suit: '#6366F1',
  underwear: '#EC4899',
};

export default function WardrobeScreen() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadWardrobe = useCallback(async () => {
    const wardrobe = await getWardrobe();
    setItems(wardrobe);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWardrobe();
    }, [loadWardrobe]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWardrobe();
    setRefreshing(false);
  }, [loadWardrobe]);

  const handleAddItem = useCallback(() => {
    Alert.alert(
      'Add Clothing Item',
      'Choose a photo source',
      [
        {
          text: 'Take Photo',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Choose from Library',
          onPress: () => pickImage('library'),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }, []);

  const pickImage = useCallback(async (source: 'camera' | 'library') => {
    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Camera access is required to photograph clothing.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Photo library access is required.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });
    }

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Error', 'Could not read image data.');
      return;
    }

    setAnalyzing(true);
    try {
      const mediaType = asset.mimeType || 'image/jpeg';
      const analysis: ClothingAnalysis = await analyzeClothing(asset.base64, mediaType);

      const newItem: WardrobeItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        imageUri: asset.uri,
        imageBase64: asset.base64,
        analysis,
        addedAt: new Date().toISOString(),
      };

      await addWardrobeItem(newItem);
      await loadWardrobe();

      Alert.alert(
        'Added!',
        `${analysis.type} added to your wardrobe.`,
        [{ text: 'Nice!' }],
      );
    } catch (err) {
      Alert.alert('Analysis failed', 'Could not analyze this item. Please try again.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }, [loadWardrobe]);

  const handleDelete = useCallback((item: WardrobeItem) => {
    Alert.alert(
      'Remove Item',
      `Remove this ${item.analysis.type} from your wardrobe?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeWardrobeItem(item.id);
            setSelectedItem(null);
            await loadWardrobe();
          },
        },
      ],
    );
  }, [loadWardrobe]);

  const renderItem = useCallback(({ item }: { item: WardrobeItem }) => {
    const catColor = CATEGORY_COLORS[item.analysis.category] || '#666';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedItem(item)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
        <View style={styles.cardOverlay}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor }]}>
            <Text style={styles.categoryText}>{item.analysis.category}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.analysis.type}
          </Text>
          <Text style={styles.cardColors} numberOfLines={1}>
            {item.analysis.color.join(' · ')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* Analyzing overlay */}
      {analyzing && (
        <View style={styles.analyzingOverlay}>
          <View style={styles.analyzingCard}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.analyzingText}>Analyzing with Claude AI...</Text>
            <Text style={styles.analyzingSubtext}>Identifying color, style & more</Text>
          </View>
        </View>
      )}

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="shirt-outline" size={72} color="#333" />
            <Text style={styles.emptyTitle}>Your wardrobe is empty</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to add your first clothing item
            </Text>
          </View>
        }
        ListHeaderComponent={
          items.length > 0 ? (
            <Text style={styles.countText}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
          ) : null
        }
      />

      {/* FAB Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddItem} activeOpacity={0.9}>
        <Ionicons name="add" size={32} color="#000000" />
      </TouchableOpacity>

      {/* Item Detail Modal */}
      <Modal
        visible={!!selectedItem}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedItem(null)}
      >
        {selectedItem && (
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <Ionicons name="close" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedItem.analysis.type}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(selectedItem)}>
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Image
                source={{ uri: selectedItem.imageUri }}
                style={styles.modalImage}
                resizeMode="contain"
              />

              <View style={styles.detailsContainer}>
                <Text style={styles.detailsHeading}>Details</Text>
                <DetailRow icon="color-palette-outline" label="Colors" value={selectedItem.analysis.color.join(', ')} />
                <DetailRow icon="grid-outline" label="Pattern" value={selectedItem.analysis.pattern} />
                <DetailRow icon="star-outline" label="Style" value={selectedItem.analysis.style} />
                <DetailRow icon="layers-outline" label="Material" value={selectedItem.analysis.material} />
                <DetailRow icon="sunny-outline" label="Season" value={selectedItem.analysis.season.join(', ')} />

                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionText}>{selectedItem.analysis.description}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={16} color="#888" style={styles.detailIcon} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  list: { padding: 16, paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  countText: { color: '#555', fontSize: 13, marginBottom: 12 },

  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.35,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  cardImage: { width: '100%', height: '75%' },
  cardOverlay: {
    flex: 1,
    padding: 8,
    backgroundColor: '#111',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryText: { color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  cardTitle: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  cardColors: { color: '#888', fontSize: 11, marginTop: 2 },

  empty: { alignItems: 'center', paddingTop: 120, paddingHorizontal: 40 },
  emptyTitle: { color: '#555', fontSize: 20, fontWeight: '700', marginTop: 20, textAlign: 'center' },
  emptySubtitle: { color: '#333', fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  analyzingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  analyzingCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: 260,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  analyzingText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 16 },
  analyzingSubtext: { color: '#666', fontSize: 13, marginTop: 6, textAlign: 'center' },

  // Modal
  modal: { flex: 1, backgroundColor: '#0A0A0A' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  modalTitle: { color: '#FFF', fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 12 },
  modalImage: { width: '100%', height: 360, backgroundColor: '#111' },

  detailsContainer: { padding: 20 },
  detailsHeading: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  detailIcon: { marginRight: 10 },
  detailLabel: { color: '#666', fontSize: 14, width: 80 },
  detailValue: { color: '#FFF', fontSize: 14, flex: 1, textAlign: 'right', textTransform: 'capitalize' },

  descriptionBox: {
    marginTop: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  descriptionText: { color: '#AAA', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
});
