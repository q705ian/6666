import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { GAME_COLORS, PIXEL_SIZE, GROUND_HEIGHT } from '@/utils/gameConstants';

interface GroundProps {
  screenWidth: number;
}

export function Ground({ screenWidth }: GroundProps) {
  const offset = useSharedValue(0);
  
  React.useEffect(() => {
    offset.value = withRepeat(
      withTiming(-screenWidth, { duration: screenWidth / 5 * 1000 }),
      -1,
      false
    );
  }, [screenWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const pixelRows = Math.ceil(GROUND_HEIGHT / PIXEL_SIZE);
  const pixelCols = Math.ceil((screenWidth * 2) / PIXEL_SIZE);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pixelContainer, { width: screenWidth * 2 }, animatedStyle]}>
        {Array.from({ length: pixelRows }).map((_, rowIndex) => (
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
                        ? GAME_COLORS.groundLine
                        : isEvenPixel
                        ? GAME_COLORS.ground
                        : GAME_COLORS.ground + 'CC',
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </Animated.View>
      <View style={styles.glowLine} />
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
  glowLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: GAME_COLORS.groundLine,
    shadowColor: GAME_COLORS.groundLine,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
  },
});
