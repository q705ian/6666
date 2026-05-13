import { View, StyleSheet, ViewStyle } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

// 骨架屏基础组件
export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const shimmer = useSharedValue(0);
  
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    return { opacity };
  });
  
  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? '#333' : '#E5E5E5',
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

// 卡片骨架屏
export function CardSkeleton() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const shimmer = useSharedValue(0);
  
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    return { opacity };
  });
  
  return (
    <View style={[cardStyles.container, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
      <Skeleton width="100%" height={120} borderRadius={16} />
      <View style={cardStyles.content}>
        <Skeleton width="60%" height={18} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} />
        <View style={cardStyles.footer}>
          <Skeleton width={60} height={24} borderRadius={12} />
          <Skeleton width={50} height={14} />
        </View>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    padding: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
});

// 首页骨架屏
export function HomeSkeleton() {
  return (
    <View style={homeStyles.container}>
      {/* Banner */}
      <Skeleton width="100%" height={160} borderRadius={20} style={{ marginBottom: 20 }} />
      
      {/* Quick Actions */}
      <View style={homeStyles.row}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={homeStyles.quickItem}>
            <Skeleton width={48} height={48} borderRadius={24} />
            <Skeleton width={40} height={12} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>
      
      {/* Section Title */}
      <Skeleton width={100} height={20} style={{ marginVertical: 20 }} />
      
      {/* Cards Grid */}
      <View style={homeStyles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </View>
    </View>
  );
}

const homeStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  quickItem: {
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

// 列表骨架屏
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={listStyles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={listStyles.item}>
          <Skeleton width={80} height={80} borderRadius={12} />
          <View style={listStyles.textContainer}>
            <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="50%" height={12} />
            <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
          </View>
          <Skeleton width={60} height={32} borderRadius={16} />
        </View>
      ))}
    </View>
  );
}

const listStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
});

// 详情页骨架屏
export function DetailSkeleton() {
  return (
    <View style={detailStyles.container}>
      <Skeleton width="100%" height={280} borderRadius={0} />
      <View style={detailStyles.content}>
        <Skeleton width="70%" height={28} style={{ marginBottom: 12 }} />
        <View style={detailStyles.row}>
          <Skeleton width={60} height={16} />
          <Skeleton width={80} height={24} borderRadius={12} />
        </View>
        <View style={detailStyles.tags}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={60} height={28} borderRadius={14} style={{ marginRight: 8 }} />
          ))}
        </View>
        <View style={detailStyles.cards}>
          <Skeleton width="48%" height={100} borderRadius={16} />
          <Skeleton width="48%" height={100} borderRadius={16} />
        </View>
        <Skeleton width="100%" height={100} borderRadius={16} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  cards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

// 徽章骨架屏
export function BadgeSkeleton() {
  return (
    <View style={badgeStyles.container}>
      <Skeleton width={120} height={28} style={{ marginBottom: 20 }} />
      <Skeleton width="100%" height={120} borderRadius={20} style={{ marginBottom: 20 }} />
      <View style={badgeStyles.tabs}>
        <Skeleton width={80} height={36} borderRadius={18} />
        <Skeleton width={80} height={36} borderRadius={18} style={{ marginLeft: 8 }} />
      </View>
      <View style={badgeStyles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={badgeStyles.badge}>
            <Skeleton width={64} height={64} borderRadius={32} />
            <Skeleton width={60} height={14} style={{ marginTop: 12 }} />
            <Skeleton width={80} height={10} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badge: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
  },
});
