import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';

interface Attraction {
  id: string;
  name: string;
  district: string;
  category: string;
  image: string;
  rating: number;
  description: string;
  tags: string[];
  open_time: string;
  ticket: string;
  story: string;
  lat: number;
  lng: number;
}

const ATTRACTION_DETAILS: Record<string, Attraction> = {
  gz_tower: {
    id: 'gz_tower',
    name: '广州塔',
    district: '海珠区',
    category: '现代',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_12618e46-93fa-4233-815c-4283c5c6eb5e.jpeg?sign=1809762590-aab807f870-0-3424e61b81b792b3bb81d91e04dab6e756c4045309f863b7e2e51100d0fb032d',
    rating: 4.8,
    description: '中国第一高塔，昵称"小蛮腰"，高600米，是广州地标建筑。夜晚灯光秀更是广州名片。',
    tags: ['地标', '夜景', '观光', '摄影'],
    open_time: '09:30-22:30',
    ticket: '150元起',
    story: '广州塔于2009年建成，是世界第三高塔。独特的设计灵感来源于女性的腰部曲线，塔身扭转形成"纤纤细腰"的视觉效果。',
    lat: 23.1065,
    lng: 113.3245,
  },
  chen_clan: {
    id: 'chen_clan',
    name: '陈家祠',
    district: '荔湾区',
    category: '岭南',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_3a9fe745-95bc-43e9-9cdd-8a6327f9e48c.jpeg?sign=1809762591-b4fc03e60f-0-5707a617615ba3a222786c6dbc362e9c657929faa5824db824d40d0c8e73c055',
    rating: 4.9,
    description: '广东现存规模最大、保存最完整的传统岭南祠堂式建筑，集岭南建筑"七绝"工艺于一身。',
    tags: ['古建筑', '博物馆', '文化', '摄影'],
    open_time: '09:00-17:30',
    ticket: '10元',
    story: '陈家祠建于清光绪年间，被誉为"岭南建筑艺术明珠"。木雕、石雕、砖雕、陶塑、灰塑、彩绘、铜铁铸，七绝工艺令人叹为观止。',
    lat: 23.1258,
    lng: 113.2436,
  },
  shamian: {
    id: 'shamian',
    name: '沙面岛',
    district: '荔湾区',
    category: '历史',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_a26ac1c0-5d7b-4d0d-a2ad-57de1ba6192a.jpeg?sign=1809762589-632d886d54-0-8c103b4dc47a9f84caa67cd7cdf13b1f4e1a79574b963844f7ee6ae61041836f',
    rating: 4.7,
    description: '广州最具异国情调的欧洲建筑群，曾是英法租界，150多座欧洲风格建筑汇聚于此。',
    tags: ['欧式建筑', '摄影', '漫步', '历史'],
    open_time: '全天开放',
    ticket: '免费',
    story: '沙面岛面积约0.3平方公里，有新巴洛克式、哥特式、券廊式等风格建筑。岛上绿树成荫，是广州最浪漫的街区之一。',
    lat: 23.1097,
    lng: 113.2389,
  },
  baiyun_mountain: {
    id: 'baiyun_mountain',
    name: '白云山',
    district: '白云区',
    category: '自然',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_0eee4af4-29d8-4e4a-9c9b-5912f9b963ab.jpeg?sign=1809762590-87f3dcd8f7-0-6524cf726764e57396f48d35a4598195dfece79f81b08351013341e1f95f3209',
    rating: 4.6,
    description: '南粤名山之一，自古有"羊城第一秀"之称，是广州市的"市肺"。',
    tags: ['登山', '自然风光', '休闲', '吸氧'],
    open_time: '06:00-22:00',
    ticket: '5元（进山费）',
    story: '白云山由30多座山峰组成，主峰摩星岭海拔382米，可俯瞰广州全景。山中有能仁寺、鸣春谷等古迹。',
    lat: 23.1824,
    lng: 113.2988,
  },
  beijing_road: {
    id: 'beijing_road',
    name: '北京路步行街',
    district: '越秀区',
    category: '美食',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_1a0e3da5-6224-427c-9031-15fb1354631f.jpeg?sign=1809762591-2e8a50b791-0-3184026a384d622c5c184e0315db711f2d4e20cb22e9cceaf7a33dae7ad435f1',
    rating: 4.5,
    description: '广州最繁华的商业步行街，千年古道遗址所在地，集购物、美食、娱乐于一体。',
    tags: ['购物', '美食', '历史遗址', '夜市'],
    open_time: '全天开放',
    ticket: '免费',
    story: '北京路是广州城建之始所在地，地下埋藏着唐、宋、元、明、清五朝路面遗址，见证了广州两千多年的历史变迁。',
    lat: 23.1249,
    lng: 113.2644,
  },
};

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

  const attraction = useMemo(() => {
    if (params.id && ATTRACTION_DETAILS[params.id]) {
      return ATTRACTION_DETAILS[params.id];
    }
    return null;
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
          <Text style={[styles.loadingText, { color: textSecondary }]}>加载中...</Text>
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

          {/* Fun Facts */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>趣味知识</Text>
            <View style={styles.factCard}>
              <View style={styles.factItem}>
                <View style={[styles.factDot, { backgroundColor: accent as string }]} />
                <Text style={[styles.factText, { color: textSecondary }]}>
                  {attraction.id === 'gz_tower' && '广州塔在世界高塔中排名第三，仅次于迪拜哈利法塔和东京晴空塔'}
                  {attraction.id === 'chen_clan' && '陈家祠屋顶的陶塑脊饰是岭南最精美的清代瓷塑艺术品'}
                  {attraction.id === 'shamian' && '沙面岛上最古老的建筑是法国传教士建于1861年的露德圣母堂'}
                  {attraction.id === 'baiyun_mountain' && '白云山每年接待游客超过1500万人次，是广州最受欢迎的景区'}
                  {attraction.id === 'beijing_road' && '北京路地下的千年古道遗址层层叠压，形成独特的"历史三明治"'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.navigateBtn]}
              onPress={handleNavigate}
            >
              <Ionicons name="navigate" size={20} color="#FFF" />
              <Text style={styles.navigateBtnText}>导航前往</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, styles.checkinBtn, { backgroundColor: accent as string }]}
              onPress={handleCheckin}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.checkinBtnText}>立即打卡</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C63FF',
  },
  content: {
    padding: 20,
    marginTop: -20,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 4,
    marginRight: 12,
  },
  districtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  districtText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  storyCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
  },
  storyIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  storyText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
  factCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  factItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  factDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  factText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  navigateBtn: {
    backgroundColor: '#00B894',
  },
  navigateBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  checkinBtn: {},
  checkinBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

import { useCSSVariable } from 'uniwind';
