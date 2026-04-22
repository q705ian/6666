import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GAME_COLORS, PIXEL_SIZE, OBSTACLE_WIDTH, GROUND_HEIGHT } from '@/utils/gameConstants';

interface ObstacleProps {
  x: number;
  height: number;
}

export function Obstacle({ x, height }: ObstacleProps) {
  const rows = Math.ceil(height / PIXEL_SIZE);
  const cols = Math.ceil(OBSTACLE_WIDTH / PIXEL_SIZE);

  return (
    <View
      style={[
        styles.container,
        {
          height,
          bottom: GROUND_HEIGHT,
          left: x,
        },
      ]}
    >
      <View style={styles.obstacleBody}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {Array.from({ length: cols }).map((_, colIndex) => {
              const isTopRow = rowIndex === 0;
              const isEvenPixel = (rowIndex + colIndex) % 2 === 0;
              return (
                <View
                  key={colIndex}
                  style={[
                    styles.pixel,
                    {
                      backgroundColor: isTopRow
                        ? '#FF6B6B'
                        : isEvenPixel
                        ? '#EF4444'
                        : '#FCA5A5',
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: OBSTACLE_WIDTH,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  obstacleBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  row: {
    flexDirection: 'row',
    height: PIXEL_SIZE,
  },
  pixel: {
    width: PIXEL_SIZE,
    height: PIXEL_SIZE,
  },
});
