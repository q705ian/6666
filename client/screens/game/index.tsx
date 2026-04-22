import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  withSequence,
  cancelAnimation
} from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Ground } from '@/components/game/Ground';
import { Obstacle } from '@/components/game/Obstacle';
import {
  GAME_SPEED_INITIAL,
  OBSTACLE_WIDTH,
  GROUND_HEIGHT,
  OBSTACLE_MIN_HEIGHT,
  OBSTACLE_MAX_HEIGHT,
  PLAYER_SIZE,
} from '@/utils/gameConstants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type GameState = 'idle' | 'playing' | 'gameover';

interface ObstacleItem {
  id: number;
  x: number;
  height: number;
}

export default function GameScreen() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [obstacles, setObstacles] = useState<ObstacleItem[]>([]);

  // 玩家位置
  const playerY = useSharedValue(0);
  const playerScale = useSharedValue(1);
  
  // 游戏状态 refs
  const gameSpeed = useRef(GAME_SPEED_INITIAL);
  const lastObstacleTime = useRef(0);
  const obstacleIdCounter = useRef(0);
  const currentScoreRef = useRef(0);
  const isPlaying = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const gameStateRef = useRef<GameState>('idle');
  
  // SharedValue refs 用于在 useEffect 外部访问
  const playerYRef = useRef(playerY);
  const playerScaleRef = useRef(playerScale);
  
  // 同步 refs
  useEffect(() => {
    playerYRef.current = playerY;
    playerScaleRef.current = playerScale;
  });

  const playerLeft = 60;
  const playerRight = playerLeft + PLAYER_SIZE;
  const groundTop = SCREEN_HEIGHT - GROUND_HEIGHT;

  // 同步游戏状态
  useEffect(() => {
    gameStateRef.current = gameState;
    isPlaying.current = gameState === 'playing';
  }, [gameState]);

  // 地面碰撞检测
  useEffect(() => {
    if (gameState !== 'playing') return;

    const intervalId = setInterval(() => {
      const py = playerYRef.current;
      if (py.value > -10 && py.value < 10) {
        py.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    }, 16);

    return () => clearInterval(intervalId);
  }, [gameState]);

  // 游戏主循环
  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const gameLoop = (currentTime: number) => {
      if (!isPlaying.current) return;

      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = currentTime;

      // 更新游戏速度
      gameSpeed.current += 0.5 * deltaTime;

      // 生成障碍物
      const spawnInterval = Math.max(0.8, 1.5 - gameSpeed.current * 0.05);
      if (currentTime - lastObstacleTime.current > spawnInterval * 1000) {
        lastObstacleTime.current = currentTime;
        
        const newId = obstacleIdCounter.current++;
        const newX = SCREEN_WIDTH + 50;
        const newHeight = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
        
        setObstacles(prev => [...prev, { id: newId, x: newX, height: newHeight }]);
      }

      // 更新障碍物位置
      setObstacles(prev => {
        const pyVal = playerYRef.current.value;
        const updated = prev
          .map(obs => ({ ...obs, x: obs.x - gameSpeed.current * 60 * deltaTime }))
          .filter(obs => obs.x > -OBSTACLE_WIDTH);

        // 碰撞检测
        const playerBottom = groundTop - pyVal;
        const playerTop = playerBottom - PLAYER_SIZE;
        const playerLeftVal = playerLeft + 6;
        const playerRightVal = playerRight - 6;

        for (const obs of updated) {
          const obsLeft = obs.x + 4;
          const obsRight = obs.x + OBSTACLE_WIDTH - 4;
          const obsTop = groundTop - obs.height;

          if (
            playerRightVal > obsLeft &&
            playerLeftVal < obsRight &&
            playerBottom > obsTop + 6 &&
            playerTop < groundTop
          ) {
            isPlaying.current = false;
            setGameState('gameover');
            setHighScore(prev => Math.max(prev, currentScoreRef.current));
            return updated;
          }
        }

        return updated;
      });

      // 更新分数
      const newScore = Math.floor(gameSpeed.current * 10);
      currentScoreRef.current = newScore;
      setScore(newScore);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, groundTop, playerLeft, playerRight]);

  // 玩家动画样式
  const playerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: -playerY.value },
        { scale: playerScale.value }
      ],
    };
  });

  // 开始游戏
  const startGame = useCallback(() => {
    const py = playerYRef.current;
    const ps = playerScaleRef.current;
    cancelAnimation(py);
    py.value = 0;
    ps.value = 1;
    setGameState('playing');
    setScore(0);
    currentScoreRef.current = 0;
    gameSpeed.current = GAME_SPEED_INITIAL;
    lastObstacleTime.current = 0;
    obstacleIdCounter.current = 0;
    setObstacles([]);
    isPlaying.current = true;
    lastTimeRef.current = performance.now();
  }, []);

  // 重置游戏
  const resetGame = useCallback(() => {
    const py = playerYRef.current;
    const ps = playerScaleRef.current;
    cancelAnimation(py);
    py.value = 0;
    ps.value = 1;
    setObstacles([]);
    gameSpeed.current = GAME_SPEED_INITIAL;
    obstacleIdCounter.current = 0;
    isPlaying.current = true;
    setGameState('playing');
    setScore(0);
    currentScoreRef.current = 0;
    lastObstacleTime.current = 0;
    lastTimeRef.current = performance.now();
  }, []);

  // 跳跃函数
  const jump = useCallback(() => {
    const py = playerYRef.current;
    const ps = playerScaleRef.current;
    if (gameStateRef.current === 'playing' && py.value >= 0) {
      py.value = withSpring(-150, {
        damping: 12,
        stiffness: 180,
        mass: 0.5,
      });
      ps.value = withSequence(
        withTiming(1.1, { duration: 50 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, []);

  // 触摸处理
  const handlePress = useCallback(() => {
    if (gameStateRef.current === 'idle') {
      startGame();
    } else if (gameStateRef.current === 'gameover') {
      resetGame();
    } else if (gameStateRef.current === 'playing') {
      jump();
    }
  }, [startGame, resetGame, jump]);

  return (
    <Screen style={styles.container}>
      <View style={styles.gameArea}>
        {/* HUD */}
        <View style={styles.hud}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>BEST</Text>
            <Text style={styles.highScoreValue}>{highScore}</Text>
          </View>
        </View>

        {/* 游戏画布 */}
        <Pressable style={styles.canvas} onPressIn={handlePress}>
          {/* 游戏元素 */}
          {gameState === 'playing' && (
            <>
              {/* 玩家角色 */}
              <Animated.View style={[styles.playerContainer, playerAnimatedStyle, { bottom: GROUND_HEIGHT }]}>
                <View style={styles.playerGlowOuter}>
                  <View style={styles.playerGlowInner}>
                    <View style={styles.playerBody}>
                      <View style={styles.playerRow}>
                        <View style={styles.playerPixel} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={styles.playerPixel} />
                      </View>
                      <View style={styles.playerRow}>
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                      </View>
                      <View style={styles.playerRow}>
                        <View style={styles.playerPixel} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={styles.playerPixel} />
                      </View>
                      <View style={styles.playerRow}>
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                      </View>
                      <View style={styles.playerRow}>
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                      </View>
                      <View style={styles.playerRow}>
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                        <View style={styles.playerPixel} />
                        <View style={styles.playerPixel} />
                        <View style={[styles.playerPixel, styles.playerPixelFilled]} />
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>

              {/* 障碍物 */}
              {obstacles.map((obstacle) => (
                <Obstacle 
                  key={obstacle.id} 
                  x={obstacle.x} 
                  height={obstacle.height} 
                />
              ))}
            </>
          )}

          <Ground screenWidth={SCREEN_WIDTH} />

          {/* 开始界面 */}
          {gameState === 'idle' && (
            <View style={styles.overlay}>
              <Text style={styles.title}>PIXEL RUN</Text>
              <Text style={styles.subtitle}>TAP TO START</Text>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>Tap to Jump</Text>
              </View>
            </View>
          )}

          {/* 游戏结束界面 */}
          {gameState === 'gameover' && (
            <View style={styles.overlay}>
              <Text style={styles.gameOverText}>GAME OVER</Text>
              <View style={styles.finalScoreBox}>
                <Text style={styles.finalScoreLabel}>SCORE</Text>
                <Text style={styles.finalScoreValue}>{score}</Text>
              </View>
              {score >= highScore && score > 0 && (
                <Text style={styles.newRecordText}>NEW RECORD!</Text>
              )}
              <Text style={styles.tapToRestart}>TAP TO RESTART</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* 操作提示 */}
      <View style={styles.controlsHint}>
        <Text style={styles.hintText}>TAP TO JUMP</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  gameArea: {
    flex: 1,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 2,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#4F46E5',
    textShadowColor: 'rgba(79, 70, 229, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  highScoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#EC4899',
    textShadowColor: 'rgba(236, 72, 153, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  playerContainer: {
    position: 'absolute',
    left: 60,
  },
  playerGlowOuter: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playerGlowInner: {
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  playerBody: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4F46E5',
    padding: 2,
  },
  playerRow: {
    flexDirection: 'row',
  },
  playerPixel: {
    width: 10,
    height: 10,
  },
  playerPixelFilled: {
    backgroundColor: '#4F46E5',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.95)',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#4F46E5',
    textShadowColor: 'rgba(79, 70, 229, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 20,
    letterSpacing: 4,
  },
  instructionBox: {
    marginTop: 40,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#EC4899',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  instructionText: {
    fontSize: 14,
    color: '#666666',
    letterSpacing: 1,
  },
  gameOverText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#EF4444',
    textShadowColor: 'rgba(239, 68, 68, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    letterSpacing: 4,
  },
  finalScoreBox: {
    marginTop: 30,
    alignItems: 'center',
  },
  finalScoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 2,
  },
  finalScoreValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#333333',
    textShadowColor: 'rgba(79, 70, 229, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  newRecordText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EC4899',
    marginTop: 10,
    letterSpacing: 2,
    textShadowColor: 'rgba(236, 72, 153, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  tapToRestart: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 40,
    letterSpacing: 2,
  },
  controlsHint: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  hintText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999999',
    letterSpacing: 1,
  },
});
