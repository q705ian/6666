import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { useCSSVariable } from 'uniwind';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 打卡记录数据
const CHECKIN_RECORDS = [
  {
    id: '1',
    attractionId: 'gz_tower',
    attractionName: '广州塔',
    district: '海珠区',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_9a03a2bc-1e7e-4d3b-8dde-ebbeddf2d0e2.jpeg',
    checkinTime: new Date(Date.now() - 86400000),
    mood: '太震撼了！',
    isValid: true,
  },
  {
    id: '2',
    attractionId: 'chen_clan',
    attractionName: '陈家祠',
    district: '荔湾区',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_55e2f59b-10fe-4494-9987-d0e356ced586.jpeg',
    checkinTime: new Date(Date.now() - 172800000),
    mood: '岭南建筑真精美',
    isValid: true,
  },
  {
    id: '3',
    attractionId: 'shamian',
    attractionName: '沙面岛',
    district: '荔湾区',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_956f9421-f5e8-452f-9a9b-c5e98f854b6b.jpeg',
    checkinTime: new Date(Date.now() - 259200000),
    mood: '很有情调的地方',
    isValid: true,
  },
];

// 附近景点数据
const NEARBY_ATTRACTIONS = [
  {
    id: 'gz_tower',
    name: '广州塔',
    district: '海珠区',
    distance: '1.2km',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_9a03a2bc-1e7e-4d3b-8dde-ebbeddf2d0e2.jpeg',
    tags: ['地标', '夜景'],
    lat: 23.1065,
    lng: 113.3245,
  },
  {
    id: 'chen_clan',
    name: '陈家祠',
    district: '荔湾区',
    distance: '2.5km',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_55e2f59b-10fe-4494-9987-d0e356ced586.jpeg',
    tags: ['古建筑', '文化'],
    lat: 23.1258,
    lng: 113.2436,
  },
  {
    id: 'shamian',
    name: '沙面岛',
    district: '荔湾区',
    distance: '3.1km',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_956f9421-f5e8-452f-9a9b-c5e98f854b6b.jpeg',
    tags: ['欧式', '历史'],
    lat: 23.1097,
    lng: 113.2389,
  },
  {
    id: 'baiyun_mountain',
    name: '白云山',
    district: '白云区',
    distance: '4.5km',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_aaec6d65-a46a-4966-8853-2683f903247f.jpeg',
    tags: ['登山', '自然'],
    lat: 23.1824,
    lng: 113.2988,
  },
  {
    id: 'beijing_road',
    name: '北京路',
    district: '越秀区',
    distance: '3.8km',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_16c736b4-df93-4e77-b765-03337010cc44.jpeg',
    tags: ['美食', '购物'],
    lat: 23.1249,
    lng: 113.2644,
  },
];

export default function CheckinScreen() {
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<'records' | 'nearby'>('records');
  const [records] = useState(CHECKIN_RECORDS);
  const [nearbyAttractions] = useState(NEARBY_ATTRACTIONS);
  const [accent, textPrimary, textSecondary, surface] = useCSSVariable([
    '--color-accent',
    '--color-foreground',
    '--color-muted',
    '--color-surface',
  ]) as string[];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  };

  const handleCheckinPress = () => {
    handleCheckin();
  };

  const handleCheckin = (id?: string, name?: string, lat?: number, lng?: number) => {
    // 跳转到打卡页面
    router.push('/checkin-action', { 
      id: id || 'gz_tower',
      name: name || '广州塔',
      lat: String(lat || 23.1065),
      lng: String(lng || 113.3245),
    });
  };

  const renderRecord = ({ item }: { item: typeof CHECKIN_RECORDS[0] }) => (
    <View style={styles.recordCard}>
      <Image source={{ uri: item.image }} style={styles.recordImage} />
      <View style={styles.recordContent}>
        <View style={styles.recordHeader}>
          <Text style={[styles.recordName, { color: textPrimary }]}>{item.attractionName}</Text>
          <View style={styles.validBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#00B894" />
            <Text style={styles.validText}>已打卡</Text>
          </View>
        </View>
        <View style={styles.recordInfo}>
          <Ionicons name="location-outline" size={12} color={textSecondary} />
          <Text style={[styles.recordDistrict, { color: textSecondary }]}>{item.district}</Text>
        </View>
        <Text style={[styles.recordMood, { color: textSecondary }]}>&quot;{item.mood}&quot;</Text>
        <Text style={[styles.recordTime, { color: textSecondary }]}>
          {formatDate(item.checkinTime)}
        </Text>
      </View>
    </View>
  );

  const renderNearbyAttraction = ({ item }: { item: typeof NEARBY_ATTRACTIONS[0] }) => (
    <TouchableOpacity 
      style={styles.nearbyCard}
      onPress={() => router.push('/attraction-detail', { id: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.nearbyImage} />
      <View style={styles.nearbyOverlay}>
        <TouchableOpacity 
          style={styles.checkinQuickBtn}
          onPress={() => handleCheckin(item.id, item.name, item.lat, item.lng)}
        >
          <Ionicons name="checkmark" size={14} color="#FFF" />
        </TouchableOpacity>
        <View style={[styles.distanceBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <Ionicons name="navigate" size={12} color="#FFFFFF" />
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>
      </View>
      <View style={styles.nearbyContent}>
        <Text style={[styles.nearbyName, { color: textPrimary }]}>{item.name}</Text>
        <Text style={[styles.nearbyDistrict, { color: textSecondary }]}>{item.district}</Text>
        <View style={styles.nearbyTags}>
          {item.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: `${accent}15` }]}>
              <Text style={[styles.tagText, { color: accent }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface }]}>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>打卡记录</Text>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: accent }]}>{records.length}</Text>
            <Text style={[styles.statLabel, { color: textSecondary }]}>已打卡</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: accent }]}>5</Text>
            <Text style={[styles.statLabel, { color: textSecondary }]}>目标</Text>
          </View>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabContainer, { backgroundColor: surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'records' && { backgroundColor: `${accent}15` },
          ]}
          onPress={() => setActiveTab('records')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'records' ? accent : textSecondary },
            ]}
          >
            打卡记录
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'nearby' && { backgroundColor: `${accent}15` },
          ]}
          onPress={() => setActiveTab('nearby')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'nearby' ? accent : textSecondary },
            ]}
          >
            附近景点
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content - Records */}
      {activeTab === 'records' && (
        <FlatList
          data={records}
          renderItem={renderRecord}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={64} color={textSecondary as string} />
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                还没有打卡记录
              </Text>
              <Text style={[styles.emptySubtext, { color: textSecondary }]}>
                点击下方按钮开始打卡吧
              </Text>
            </View>
          }
        />
      )}

      {/* Content - Nearby */}
      {activeTab === 'nearby' && (
        <FlatList
          data={nearbyAttractions}
          renderItem={renderNearbyAttraction}
          keyExtractor={(item) => `nearby-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="compass-outline" size={64} color={textSecondary as string} />
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                暂无附近景点
              </Text>
            </View>
          }
        />
      )}

      {/* Check-in Button */}
      <TouchableOpacity style={styles.checkinBtn} onPress={handleCheckinPress}>
        <LinearGradient
          colors={[accent as string, `${accent}CC`]}
          style={styles.checkinGradient}
        >
          <Ionicons name="location" size={24} color="#FFFFFF" />
          <Text style={styles.checkinText}>开始打卡</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  recordCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  recordImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  recordContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordName: {
    fontSize: 16,
    fontWeight: '700',
  },
  validBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  validText: {
    fontSize: 11,
    color: '#00B894',
    fontWeight: '600',
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  recordDistrict: {
    fontSize: 12,
    marginLeft: 2,
  },
  recordMood: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  recordTime: {
    fontSize: 11,
    marginTop: 4,
  },
  nearbyCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  nearbyImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#E0E0E0',
  },
  nearbyOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  checkinQuickBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  distanceText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  nearbyContent: {
    padding: 12,
  },
  nearbyName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  nearbyDistrict: {
    fontSize: 11,
    marginBottom: 8,
  },
  nearbyTags: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 8,
  },
  checkinBtn: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
  },
  checkinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkinText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
