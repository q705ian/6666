import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useCSSVariable } from 'uniwind';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const { width } = Dimensions.get('window');

// 景点数据
const ATTRACTIONS = [
  {
    id: 'gz_tower',
    name: '广州塔',
    district: '海珠区',
    category: '现代',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_9a03a2bc-1e7e-4d3b-8dde-ebbeddf2d0e2.jpeg',
    rating: 4.8,
    description: '中国第一高塔，昵称"小蛮腰"',
    tags: ['地标', '夜景', '观光'],
  },
  {
    id: 'chen_clan',
    name: '陈家祠',
    district: '荔湾区',
    category: '岭南',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_55e2f59b-10fe-4494-9987-d0e356ced586.jpeg',
    rating: 4.9,
    description: '岭南建筑艺术明珠',
    tags: ['古建筑', '文化', '摄影'],
  },
  {
    id: 'shamian',
    name: '沙面岛',
    district: '荔湾区',
    category: '历史',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_956f9421-f5e8-452f-9a9b-c5e98f854b6b.jpeg',
    rating: 4.7,
    description: '广州最具异国情调的欧洲建筑群',
    tags: ['欧式', '漫步', '历史'],
  },
  {
    id: 'baiyun_mountain',
    name: '白云山',
    district: '白云区',
    category: '自然',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_aaec6d65-a46a-4966-8853-2683f903247f.jpeg',
    rating: 4.6,
    description: '南粤名山，羊城第一秀',
    tags: ['登山', '自然', '吸氧'],
  },
  {
    id: 'beijing_road',
    name: '北京路',
    district: '越秀区',
    category: '美食',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_16c736b4-df93-4e77-b765-03337010cc44.jpeg',
    rating: 4.5,
    description: '千年古道，繁华商圈',
    tags: ['购物', '美食', '夜市'],
  },
];

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
    if (actionId === 'chat') {
      router.push('/chat');
    } else if (actionId === 'plan') {
      router.push('/chat');
    } else if (actionId === 'nearby') {
      router.push('/checkin');
    } else if (actionId === 'food') {
      router.push('/chat');
    }
  };

  const handleAttractionPress = (id: string) => {
    router.push('/attraction-detail', { id });
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
                    <View style={styles.attractionRating}>
                      <Ionicons name="star" size={12} color="#FDCB6E" />
                      <Text style={styles.attractionRatingText}>{attraction.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          </View>
        </View>

        {/* Today Stats */}
        <View style={styles.section}>
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={[styles.statsTitle, { color: textPrimary }]}>今日打卡</Text>
              <Text style={[styles.statsDate, { color: textSecondary }]}>
                {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
              </Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: accent }]}>3</Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>打卡景点</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: accent }]}>156</Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>获得积分</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: accent }]}>2</Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>解锁徽章</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recommended Routes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>精选路线</Text>
          </View>
          <View style={styles.routeList}>
            <TouchableOpacity 
              style={styles.routeCard}
              onPress={() => router.push('/chat')}
            >
              <View style={[styles.routeImage, { backgroundColor: `${accent}20` }]}>
                <Ionicons name="sunny" size={32} color={accent as string} />
              </View>
              <View style={styles.routeContent}>
                <Text style={[styles.routeName, { color: textPrimary }]}>经典一日游</Text>
                <Text style={[styles.routeDesc, { color: textSecondary }]}>
                  广州塔 → 陈家祠 → 沙面 → 北京路
                </Text>
                <View style={styles.routeTags}>
                  <View style={[styles.routeTag, { backgroundColor: `${accent}15` }]}>
                    <Text style={[styles.routeTagText, { color: accent }]}>6小时</Text>
                  </View>
                  <View style={[styles.routeTag, { backgroundColor: `${accent}15` }]}>
                    <Text style={[styles.routeTagText, { color: accent }]}>5个景点</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.routeCard}
              onPress={() => router.push('/chat')}
            >
              <View style={[styles.routeImage, { backgroundColor: '#00B89415' }]}>
                <Ionicons name="moon" size={32} color="#00B894" />
              </View>
              <View style={styles.routeContent}>
                <Text style={[styles.routeName, { color: textPrimary }]}>夜景打卡</Text>
                <Text style={[styles.routeDesc, { color: textSecondary }]}>
                  珠江夜游 → 广州塔 → 太古仓
                </Text>
                <View style={styles.routeTags}>
                  <View style={[styles.routeTag, { backgroundColor: '#00B89415' }]}>
                    <Text style={[styles.routeTagText, { color: '#00B894' }]}>3小时</Text>
                  </View>
                  <View style={[styles.routeTag, { backgroundColor: '#00B89415' }]}>
                    <Text style={[styles.routeTagText, { color: '#00B894' }]}>3个景点</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </Screen>
  );
}

const borderColor = 'rgba(0,0,0,0.06)';

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  bannerBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
  },
  bannerDecor: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    zIndex: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionMore: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
    width: (width - 48) / 4,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  attractionList: {
    paddingRight: 16,
  },
  attractionCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  attractionImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#E0E0E0',
  },
  attractionOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  attractionBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attractionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6C63FF',
  },
  attractionContent: {
    padding: 12,
  },
  attractionName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  attractionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attractionDistrict: {
    fontSize: 11,
    marginLeft: 2,
    marginRight: 8,
  },
  attractionRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attractionRatingText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
    color: '#666',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statsDate: {
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  routeList: {
    gap: 12,
  },
  routeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  routeImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  routeContent: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  routeDesc: {
    fontSize: 12,
    marginBottom: 8,
  },
  routeTags: {
    flexDirection: 'row',
    gap: 8,
  },
  routeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  routeTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});
