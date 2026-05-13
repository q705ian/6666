import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  cancelAnimation,
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

  // 玩家位置和速度
  const playerY = useSharedValue(0);
  const playerVelocity = useRef(0);
  const isJumping = useRef(false);
  
  // 游戏状态 refs
  const gameSpeed = useRef(GAME_SPEED_INITIAL);
  const lastObstacleTime = useRef(0);
  const obstacleIdCounter = useRef(0);
  const currentScoreRef = useRef(0);
  const isPlaying = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const gameStateRef = useRef<GameState>('idle');
  
  // 函数 refs
  const jumpFnRef = useRef<() => void | null>(null);
  const startGameFnRef = useRef<() => void | null>(null);
  const resetGameFnRef = useRef<() => void | null>(null);
  
  // SharedValue refs
  const playerYRef = useRef(playerY);
  
  // 同步 refs
  useEffect(() => {
    playerYRef.current = playerY;
  });

  const playerLeft = 60;
  const playerRight = playerLeft + PLAYER_SIZE;
  const groundTop = SCREEN_HEIGHT - GROUND_HEIGHT;

  // 同步游戏状态
  useEffect(() => {
    gameStateRef.current = gameState;
    isPlaying.current = gameState === 'playing';
  }, [gameState]);

  // 跳跃函数
  const jump = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    if (isJumping.current) return;
    
    isJumping.current = true;
    playerVelocity.current = -18;
  }, []);

  // 键盘控制处理
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      
      // W/空格/上箭头 - 跳跃（游戏中）或开始游戏（非游戏中）
      if (e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        
        if (state === 'idle') {
          // 开始游戏
          startGameFnRef.current?.();
          // 开始游戏后也要跳跃
          setTimeout(() => jumpFnRef.current?.(), 50);
        } else if (state === 'gameover') {
          // 重置游戏
          resetGameFnRef.current?.();
        } else if (state === 'playing') {
          // 跳跃
          jumpFnRef.current?.();
        }
      }
      
      // Enter - 开始/重置游戏
      if (e.key === 'Enter') {
        if (state === 'idle') {
          startGameFnRef.current?.();
        } else if (state === 'gameover') {
          resetGameFnRef.current?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 游戏主循环
  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const updatePlayer = () => {
      if (!isPlaying.current) return;
      
      // 物理模拟：playerY 代表上升高度（正值向上）
      const gravity = 0.8;
      playerVelocity.current -= gravity; // 重力减少速度
      playerY.value += playerVelocity.current;
      
      // 地面碰撞：playerY 回到 0
      if (playerY.value <= 0) {
        playerY.value = 0;
        playerVelocity.current = 0;
        isJumping.current = false;
      }
    };

    const gameLoop = (currentTime: number) => {
      if (!isPlaying.current) return;

      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = currentTime;

      // 更新玩家物理
      updatePlayer();

      // 更新游戏速度
      gameSpeed.current += 0.3 * deltaTime;

      // 生成障碍物
      const spawnInterval = Math.max(0.8, 1.5 - gameSpeed.current * 0.03);
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

        // 碰撞检测 - playerY 代表上升高度
        const playerBottom = groundTop + pyVal;
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
  }, [gameState, groundTop, playerLeft, playerRight, playerY]);

  // 玩家动画样式 - playerY 为正时向上移动
  const playerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: -playerY.value }, // playerY 正值向上，所以要取反
      ],
    };
  });

  // 开始游戏
  const startGame = useCallback(() => {
    const py = playerYRef.current;
    cancelAnimation(py);
    py.value = 0;
    playerVelocity.current = 0;
    isJumping.current = false;
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
    cancelAnimation(py);
    py.value = 0;
    playerVelocity.current = 0;
    isJumping.current = false;
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

  // 更新函数 refs
  useEffect(() => {
    jumpFnRef.current = jump;
    startGameFnRef.current = startGame;
    resetGameFnRef.current = resetGame;
  }, [jump, startGame, resetGame]);

  // 点击/触摸处理
  const handlePress = useCallback(() => {
    if (gameStateRef.current === 'idle') {
      startGame();
      // 开始游戏后也要跳跃
      setTimeout(() => jumpFnRef.current?.(), 50);
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
        <Pressable style={styles.canvas} onPress={handlePress}>
          {/* 游戏元素 */}
          {gameState === 'playing' && (
            <>
              {/* 玩家角色 */}
              <Animated.View style={[styles.playerContainer, playerAnimatedStyle, { bottom: GROUND_HEIGHT }]}>
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
                <Text style={styles.instructionText}>Tap / W to Jump</Text>
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
        <Text style={styles.hintText}>TAP OR W KEY</Text>
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
    textAlign: 'center',
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
    fontSize: 20,
    fontWeight: '800',
    color: '#EC4899',
    marginTop: 16,
    letterSpacing: 2,
  },
  tapToRestart: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginTop: 30,
    letterSpacing: 2,
  },
  controlsHint: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#999999',
    letterSpacing: 2,
    fontWeight: '500',
  },
});
