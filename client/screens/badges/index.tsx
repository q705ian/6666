import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useCSSVariable } from 'uniwind';

// 徽章数据
const BADGES = [
  {
    id: '1',
    name: '初来乍到',
    description: '完成第一次打卡',
    icon: 'footsteps',
    color: '#6C63FF',
    progress: 100,
    isUnlocked: true,
    unlockTime: '2024-01-15',
  },
  {
    id: '2',
    name: '羊城探索者',
    description: '打卡5个不同景点',
    icon: 'compass',
    color: '#FF6584',
    progress: 60,
    isUnlocked: false,
  },
  {
    id: '3',
    name: '夜景达人',
    description: '打卡3个夜景景点',
    icon: 'moon',
    color: '#0EA5E9',
    progress: 33,
    isUnlocked: false,
  },
  {
    id: '4',
    name: '美食家',
    description: '打卡5个美食地点',
    icon: 'restaurant',
    color: '#FDCB6E',
    progress: 40,
    isUnlocked: false,
  },
  {
    id: '5',
    name: '岭南文化迷',
    description: '打卡所有岭南建筑',
    icon: 'business',
    color: '#854D0E',
    progress: 25,
    isUnlocked: false,
  },
  {
    id: '6',
    name: '历史爱好者',
    description: '打卡5个历史景点',
    icon: 'time',
    color: '#78716C',
    progress: 60,
    isUnlocked: false,
  },
  {
    id: '7',
    name: '自然氧吧',
    description: '打卡3个自然景点',
    icon: 'leaf',
    color: '#059669',
    progress: 66,
    isUnlocked: false,
  },
  {
    id: '8',
    name: '全城打卡王',
    description: '打卡广州市所有区县',
    icon: 'trophy',
    color: '#FBBF24',
    progress: 20,
    isUnlocked: false,
  },
];

// 用户成就统计
const STATS = {
  totalCheckins: 12,
  totalPoints: 580,
  districtsExplored: 4,
  totalDistricts: 11,
  rank: '白银导游',
};

export default function BadgesScreen() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'unlocked'>('all');
  const [accent, textPrimary, textSecondary, surface] = useCSSVariable([
    '--color-accent',
    '--color-foreground',
    '--color-muted',
    '--color-surface',
  ]) as string[];

  const unlockedBadges = BADGES.filter((b) => b.isUnlocked);
  const displayedBadges = selectedTab === 'all' ? BADGES : unlockedBadges;

  const renderBadge = (badge: typeof BADGES[0]) => (
    <View key={badge.id} style={styles.badgeCard}>
      <View
        style={[
          styles.badgeIconContainer,
          {
            backgroundColor: badge.isUnlocked ? `${badge.color}20` : 'rgba(0,0,0,0.05)',
          },
        ]}
      >
        <Ionicons
          name={badge.icon as any}
          size={32}
          color={badge.isUnlocked ? badge.color : textSecondary as string}
        />
        {!badge.isUnlocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text style={[styles.badgeName, { color: textPrimary }]}>{badge.name}</Text>
      <Text style={[styles.badgeDesc, { color: textSecondary }]}>{badge.description}</Text>
      {badge.isUnlocked ? (
        <View style={[styles.unlockedBadge, { backgroundColor: `${badge.color}20` }]}>
          <Ionicons name="checkmark-circle" size={12} color={badge.color} />
          <Text style={[styles.unlockedText, { color: badge.color }]}>已解锁</Text>
        </View>
      ) : (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${badge.progress}%`, backgroundColor: badge.color },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: textSecondary }]}>
            {badge.progress}%
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>我的成就</Text>
          <View style={styles.rankBadge}>
            <Ionicons name="medal" size={16} color={textPrimary as string} />
            <Text style={[styles.rankText, { color: textPrimary }]}>{STATS.rank}</Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: surface }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: accent }]}>{STATS.totalCheckins}</Text>
              <Text style={[styles.statLabel, { color: textSecondary }]}>打卡总数</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: accent }]}>{STATS.totalPoints}</Text>
              <Text style={[styles.statLabel, { color: textSecondary }]}>积分总数</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: accent }]}>
                {STATS.districtsExplored}/{STATS.totalDistricts}
              </Text>
              <Text style={[styles.statLabel, { color: textSecondary }]}>探索区县</Text>
            </View>
          </View>
          <View style={styles.unlockedInfo}>
            <Ionicons name="ribbon" size={16} color={accent as string} />
            <Text style={[styles.unlockedTextMain, { color: textPrimary }]}>
              已解锁 {unlockedBadges.length} 个徽章
            </Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'all' && { backgroundColor: `${accent}15` },
            ]}
            onPress={() => setSelectedTab('all')}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === 'all' ? accent : textSecondary },
              ]}
            >
              全部徽章
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'unlocked' && { backgroundColor: `${accent}15` },
            ]}
            onPress={() => setSelectedTab('unlocked')}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === 'unlocked' ? accent : textSecondary },
              ]}
            >
              已解锁
            </Text>
          </TouchableOpacity>
        </View>

        {/* Badge Grid */}
        <View style={styles.badgeGrid}>
          {displayedBadges.map(renderBadge)}
        </View>

        {/* Achievement Tips */}
        <View style={[styles.tipsCard, { backgroundColor: surface }]}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={accent as string} />
            <Text style={[styles.tipsTitle, { color: textPrimary }]}>成就攻略</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={[styles.tipIcon, { backgroundColor: '#6C63FF15' }]}>
                <Ionicons name="location" size={14} color="#6C63FF" />
              </View>
              <Text style={[styles.tipText, { color: textSecondary }]}>
                前往不同景点打卡可加速解锁成就
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipIcon, { backgroundColor: '#FF658415' }]}>
                <Ionicons name="camera" size={14} color="#FF6584" />
              </View>
              <Text style={[styles.tipText, { color: textSecondary }]}>
                拍摄景点照片有机会触发隐藏成就
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipIcon, { backgroundColor: '#00B89415' }]}>
                <Ionicons name="time" size={14} color="#00B894" />
              </View>
              <Text style={[styles.tipText, { color: textSecondary }]}>
                每天签到可获得额外积分加成
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </Screen>
  );
}

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
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  unlockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  unlockedTextMain: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 2,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  unlockedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tipsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 20,
  },
});