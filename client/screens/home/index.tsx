import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useCSSVariable } from 'uniwind';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { ATTRACTIONS, ROUTES } from '@/constants/attractions';

const { width } = Dimensions.get('window');

// 快速入口数据
const QUICK_ACTIONS = [
  { id: 'chat', icon: 'chatbubbles', label: 'AI 导游', color: '#6C63FF' },
  { id: 'plan', icon: 'map', label: '行程规划', color: '#FF6584' },
  { id: 'nearby', icon: 'navigate', label: '附近景点', color: '#00B894' },
  { id: 'food', icon: 'restaurant', label: '美食推荐', color: '#FDCB6E' },
];

export default function HomeScreen() {
  const router = useSafeRouter();
  const [accent, textPrimary, textSecondary, surface] = useCSSVariable([
    '--color-accent',
    '--color-foreground',
    '--color-muted',
    '--color-surface',
  ]) as string[];

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'chat' || actionId === 'plan' || actionId === 'food') {
      router.push('/chat');
    } else if (actionId === 'nearby') {
      router.push('/checkin');
    }
  };

  const handleAttractionPress = (id: string) => {
    router.push('/attraction-detail', { id });
  };

  const handleRoutePress = (routeId: string) => {
    router.push('/chat');
  };

  return (
    <Screen>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: textSecondary }]}>欢迎来到</Text>
            <Text style={[styles.title, { color: textPrimary }]}>羊城印记</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color={textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <LinearGradient
          colors={[accent as string, `${accent}99`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>探索广州之美</Text>
            <Text style={styles.bannerSubtitle}>让AI导游带你发现城市的独特魅力</Text>
            <TouchableOpacity 
              style={styles.bannerBtn}
              onPress={() => router.push('/chat')}
            >
              <Text style={styles.bannerBtnText}>开始探索</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bannerDecor}>
            <Ionicons name="location" size={80} color="rgba(255,255,255,0.2)" />
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionItem}
                onPress={() => handleQuickAction(action.id)}
              >
                <View 
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: `${action.color}15` }
                  ]}
                >
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={[styles.quickActionLabel, { color: textPrimary }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Attractions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>热门景点</Text>
            <TouchableOpacity onPress={() => router.push('/checkin')}>
              <Text style={[styles.sectionMore, { color: accent }]}>查看更多</Text>
            </TouchableOpacity>
          </View>
          <View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.attractionList}
            >
            {ATTRACTIONS.map((attraction) => (
              <TouchableOpacity
                key={attraction.id}
                style={styles.attractionCard}
                onPress={() => handleAttractionPress(attraction.id)}
              >
                <Image
                  source={{ uri: attraction.image }}
                  style={styles.attractionImage}
                  resizeMode="cover"
                />
                <View style={styles.attractionOverlay}>
                  <View style={styles.attractionBadge}>
                    <Text style={styles.attractionBadgeText}>{attraction.category}</Text>
                  </View>
                </View>
                <View style={styles.attractionContent}>
                  <Text style={[styles.attractionName, { color: textPrimary }]}>
                    {attraction.name}
                  </Text>
                  <View style={styles.attractionInfo}>
                    <Ionicons name="location" size={12} color={textSecondary} />
                    <Text style={[styles.attractionDistrict, { color: textSecondary }]}>
                      {attraction.district}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          </View>
        </View>

        {/* Selected Routes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>精选路线</Text>
          </View>
          <View style={styles.routesContainer}>
            {ROUTES.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={styles.routeCard}
                onPress={() => handleRoutePress(route.id)}
              >
                <Image
                  source={{ uri: route.image }}
                  style={styles.routeImage}
                  resizeMode="cover"
                />
                <View style={[styles.routeContent, { backgroundColor: surface }]}>
                  <Text style={[styles.routeName, { color: textPrimary }]}>
                    {route.name}
                  </Text>
                  <Text style={[styles.routeDesc, { color: textSecondary }]} numberOfLines={2}>
                    {route.description}
                  </Text>
                  <View style={styles.routeMeta}>
                    <View style={styles.routeMetaItem}>
                      <Ionicons name="time-outline" size={14} color={textSecondary} />
                      <Text style={[styles.routeMetaText, { color: textSecondary }]}>
                        {route.duration}
                      </Text>
                    </View>
                    <View style={styles.routeMetaItem}>
                      <Ionicons name="location-outline" size={14} color={textSecondary} />
                      <Text style={[styles.routeMetaText, { color: textSecondary }]}>
                        {route.spots.length}个景点
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  bannerBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  bannerDecor: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionMore: {
    fontSize: 14,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
  },
  attractionList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  attractionCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  attractionImage: {
    width: '100%',
    height: 120,
  },
  attractionOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  attractionBadge: {
    backgroundColor: 'rgba(108, 99, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attractionBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  attractionContent: {
    padding: 12,
  },
  attractionName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  attractionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attractionDistrict: {
    fontSize: 12,
  },
  routesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  routeImage: {
    width: '100%',
    height: 140,
  },
  routeContent: {
    padding: 16,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  routeDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  routeMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  routeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeMetaText: {
    fontSize: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});
