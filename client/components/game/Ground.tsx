import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence, withDelay } from 'react-native-reanimated';
import { GAME_COLORS, PIXEL_SIZE, GROUND_HEIGHT } from '@/utils/gameConstants';

interface GroundProps {
  screenWidth: number;
}

export function Ground({ screenWidth }: GroundProps) {
  const offset1 = useSharedValue(0);
  const offset2 = useSharedValue(-screenWidth);

  useEffect(() => {
    // 两个地面图层交替滚动形成无缝效果
    offset1.value = withRepeat(
      withTiming(-screenWidth, { duration: 2000, easing: (t) => t }),
      -1,
      false
    );
    offset2.value = withRepeat(
      withTiming(-screenWidth, { duration: 2000, easing: (t) => t }),
      -1,
      false
    );
  }, [screenWidth, offset1, offset2]);

  const pixelRows = Math.ceil(GROUND_HEIGHT / PIXEL_SIZE);
  const pixelCols = Math.ceil(screenWidth / PIXEL_SIZE);

  const renderPixelRow = (rowIndex: number) => (
    <View key={rowIndex} style={styles.row}>
      {Array.from({ length: pixelCols }).map((_, colIndex) => {
        const isTopLine = rowIndex === 0;
        const isEvenPixel = (rowIndex + colIndex) % 2 === 0;
        return (
          <View
            key={`${rowIndex}-${colIndex}`}
            style={[
              styles.pixel,
              {
                backgroundColor: isTopLine
                  ? '#4F46E5'
                  : isEvenPixel
                  ? '#E5E5E5'
                  : '#F0F0F0',
              },
            ]}
          />
        );
      })}
    </View>
  );

  const pixelLayer = (
    <View style={[styles.pixelContainer, { width: screenWidth }]}>
      {Array.from({ length: pixelRows }).map((_, rowIndex) => renderPixelRow(rowIndex))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 第一个滚动层 */}
      <Animated.View 
        style={[
          styles.scrollLayer,
          { transform: [{ translateX: offset1.value }] }
        ]}
      >
        {pixelLayer}
        {pixelLayer}
      </Animated.View>
      
      {/* 第二个滚动层（错开） */}
      <Animated.View 
        style={[
          styles.scrollLayer,
          { transform: [{ translateX: offset2.value }] }
        ]}
      >
        {pixelLayer}
        {pixelLayer}
      </Animated.View>
      
      {/* 顶部装饰线 */}
      <View style={styles.topLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: GROUND_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  scrollLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    height: GROUND_HEIGHT,
  },
  pixelContainer: {
    flexDirection: 'column',
    height: GROUND_HEIGHT,
  },
  row: {
    flexDirection: 'row',
    height: PIXEL_SIZE,
  },
  pixel: {
    width: PIXEL_SIZE,
    height: PIXEL_SIZE,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
});
