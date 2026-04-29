import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useCSSVariable } from 'uniwind';

// 用户数据
const USER_DATA = {
  name: '广州探索者',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  level: 8,
  points: 580,
  checkins: 12,
  followers: 256,
  following: 128,
};

// 菜单项类型定义
interface MenuItem {
  id: string;
  icon: string;
  label: string;
  toggle?: boolean;
  value?: string | boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// 菜单项
const MENU_SECTIONS: MenuSection[] = [
  {
    title: '打卡管理',
    items: [
      { id: 'checkin_history', icon: 'time', label: '打卡历史', value: '12次' },
      { id: 'favorites', icon: 'heart', label: '收藏景点', value: '8个' },
      { id: 'my_routes', icon: 'map', label: '我的路线', value: '3条' },
    ],
  },
  {
    title: '设置',
    items: [
      { id: 'notifications', icon: 'notifications', label: '消息通知', toggle: true, value: true },
      { id: 'dark_mode', icon: 'moon', label: '深色模式', toggle: true, value: false },
      { id: 'language', icon: 'language', label: '语言', value: '简体中文' },
    ],
  },
  {
    title: '其他',
    items: [
      { id: 'help', icon: 'help-circle', label: '帮助与反馈' },
      { id: 'about', icon: 'information-circle', label: '关于我们' },
      { id: 'settings', icon: 'settings', label: '设置' },
    ],
  },
];

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [accent, textPrimary, textSecondary, surface] = useCSSVariable([
    '--color-accent',
    '--color-foreground',
    '--color-muted',
    '--color-surface',
  ]) as string[];

  const renderMenuItem = (item: MenuItem) => {
    if (item.toggle) {
      const isNotifications = item.id === 'notifications';
      const currentValue = isNotifications ? notificationsEnabled : darkModeEnabled;
      return (
        <View key={item.id} style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: `${accent}15` }]}>
              <Ionicons name={item.icon as any} size={20} color={accent as string} />
            </View>
            <Text style={[styles.menuLabel, { color: textPrimary }]}>{item.label}</Text>
          </View>
          <Switch
            value={currentValue}
            onValueChange={(value) => {
              if (isNotifications) {
                setNotificationsEnabled(value);
              } else if (item.id === 'dark_mode') {
                setDarkModeEnabled(value);
              }
            }}
            trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${accent}50` }}
            thumbColor={currentValue ? accent : '#fff'}
          />
        </View>
      );
    }

    const displayValue = typeof item.value === 'string' ? item.value : undefined;
    return (
      <TouchableOpacity key={item.id} style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuIcon, { backgroundColor: `${accent}15` }]}>
            <Ionicons name={item.icon as any} size={20} color={accent as string} />
          </View>
          <Text style={[styles.menuLabel, { color: textPrimary }]}>{item.label}</Text>
        </View>
        <View style={styles.menuItemRight}>
          {displayValue && (
            <Text style={[styles.menuValue, { color: textSecondary }]}>{displayValue}</Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={textSecondary as string} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: surface }]}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={24} color={textPrimary as string} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="share-outline" size={24} color={textPrimary as string} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: USER_DATA.avatar }} style={styles.avatar} />
            <View style={[styles.levelBadge, { backgroundColor: accent }]}>
              <Text style={styles.levelText}>Lv.{USER_DATA.level}</Text>
            </View>
          </View>
          <Text style={[styles.userName, { color: textPrimary }]}>{USER_DATA.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: textPrimary }]}>{USER_DATA.checkins}</Text>
              <Text style={[styles.statLabel, { color: textSecondary }]}>打卡</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: textPrimary }]}>{USER_DATA.followers}</Text>
              <Text style={[styles.statLabel, { color: textSecondary }]}>粉丝</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: textPrimary }]}>{USER_DATA.following}</Text>
              <Text style={[styles.statLabel, { color: textSecondary }]}>关注</Text>
            </View>
          </View>
        </View>

        {/* Points Card */}
        <View style={[styles.pointsCard, { backgroundColor: surface }]}>
          <View style={styles.pointsInfo}>
            <View>
              <Text style={[styles.pointsLabel, { color: textSecondary }]}>当前积分</Text>
              <Text style={[styles.pointsValue, { color: accent }]}>{USER_DATA.points}</Text>
            </View>
            <TouchableOpacity style={[styles.pointsBtn, { backgroundColor: `${accent}15` }]}>
              <Text style={[styles.pointsBtnText, { color: accent }]}>积分商城</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.levelProgress}>
            <View style={styles.levelInfo}>
              <Text style={[styles.levelInfoText, { color: textSecondary }]}>
                Lv.{USER_DATA.level}
              </Text>
              <Text style={[styles.levelInfoText, { color: textSecondary }]}>
                Lv.{USER_DATA.level + 1}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: accent, width: '65%' }]} />
            </View>
            <Text style={[styles.progressHint, { color: textSecondary }]}>
              再获得 200 积分可升级
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: textSecondary }]}>{section.title}</Text>
            <View style={[styles.menuCard, { backgroundColor: surface }]}>
              {section.items.map(renderMenuItem)}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={[styles.logoutText, { color: '#FF6B6B' }]}>退出登录</Text>
        </TouchableOpacity>

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
    justifyContent: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
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
  pointsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pointsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  pointsBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  levelProgress: {
    gap: 8,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelInfoText: {
    fontSize: 11,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 11,
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuValue: {
    fontSize: 14,
  },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});
