import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useCSSVariable } from 'uniwind';
import { ATTRACTIONS } from '@/constants/attractions';
import type { Attraction } from '@/types';

export default function AttractionDetailScreen() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const [accent, textPrimary, textSecondary, surface] = useCSSVariable([
    '--color-accent',
    '--color-foreground',
    '--color-muted',
    '--color-surface',
  ]) as string[];

  const attraction = useMemo<Attraction | undefined>(() => {
    if (params.id) {
      return ATTRACTIONS.find(a => a.id === params.id);
    }
    return undefined;
  }, [params.id]);

  const handleNavigate = async () => {
    if (!attraction) return;
    
    const { lat, lng, name } = attraction;
    const encodedName = encodeURIComponent(name);
    
    // 优先使用高德地图App（移动端）
    const amapUrl = `amap://route?sourceApplication=羊城印记&dlat=${lat}&dlon=${lng}&dname=${encodedName}&dev=0&t=0`;
    const appleUrl = `http://maps.apple.com/?daddr=${lat},${lng}&q=${encodedName}`;
    
    // Web环境使用高德地图网页版
    const amapWebUrl = `https://uri.amap.com/navigation?to=${lng},${lat},${encodedName}&mode=car&callnative=0`;
    
    try {
      if (Platform.OS === 'ios') {
        // iOS尝试打开苹果地图，失败则用网页版
        const canOpen = await Linking.canOpenURL(appleUrl);
        if (canOpen) {
          await Linking.openURL(appleUrl);
        } else {
          await Linking.openURL(amapWebUrl);
        }
      } else {
        // Android尝试打开高德App，失败则用网页版
        const canOpen = await Linking.canOpenURL(amapUrl);
        if (canOpen) {
          await Linking.openURL(amapUrl);
        } else {
          await Linking.openURL(amapWebUrl);
        }
      }
    } catch (error) {
      // 所有方式都失败时，使用网页版高德地图
      await Linking.openURL(amapWebUrl);
    }
  };

  const handleCheckin = () => {
    if (!attraction) return;
    router.push('/checkin-action', { 
      id: attraction.id,
      name: attraction.name,
      lat: String(attraction.lat),
      lng: String(attraction.lng),
    });
  };

  const handleBack = () => {
    router.back();
  };

  if (!attraction) {
    return (
      <Screen safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textSecondary }]}>景点未找到</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: attraction.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          
          {/* Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{attraction.category}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: textPrimary }]}>{attraction.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FDCB6E" />
              <Text style={[styles.rating, { color: textPrimary }]}>{attraction.rating}</Text>
              <View style={[styles.districtBadge, { backgroundColor: `${accent}15` }]}>
                <Ionicons name="location" size={12} color={accent as string} />
                <Text style={[styles.districtText, { color: accent }]}>{attraction.district}</Text>
              </View>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {attraction.tags.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: `${accent}10` }]}>
                <Text style={[styles.tagText, { color: accent }]}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={24} color={accent as string} />
              <Text style={[styles.infoLabel, { color: textSecondary }]}>开放时间</Text>
              <Text style={[styles.infoValue, { color: textPrimary }]}>{attraction.open_time}</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="card-outline" size={24} color={accent as string} />
              <Text style={[styles.infoLabel, { color: textSecondary }]}>门票价格</Text>
              <Text style={[styles.infoValue, { color: textPrimary }]}>{attraction.ticket}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>景点简介</Text>
            <Text style={[styles.description, { color: textSecondary }]}>{attraction.description}</Text>
          </View>

          {/* Story */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>历史故事</Text>
            <View style={[styles.storyCard, { backgroundColor: `${accent}08` }]}>
              <Ionicons name="book-outline" size={20} color={accent as string} style={styles.storyIcon} />
              <Text style={[styles.storyText, { color: textSecondary }]}>{attraction.story}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { backgroundColor: surface }]}>
        <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleNavigate}>
          <Ionicons name="navigate" size={22} color={accent as string} />
          <Text style={[styles.actionBtnSecondaryText, { color: accent }]}>导航前往</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtnPrimary, { backgroundColor: accent }]} onPress={handleCheckin}>
          <Ionicons name="camera" size={22} color="#FFF" />
          <Text style={styles.actionBtnPrimaryText}>立即打卡</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 15,
    fontWeight: '700',
  },
  districtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  districtText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 11,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  storyCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  storyIcon: {
    flexShrink: 0,
  },
  storyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  actionBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionBtnPrimary: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  actionBtnPrimaryText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
