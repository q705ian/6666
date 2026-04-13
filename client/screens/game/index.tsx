import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Ground } from '@/components/game/Ground';
import { Obstacle } from '@/components/game/Obstacle';
import {
  GAME_COLORS,
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

  // Player physics using animated values
  const playerY = useSharedValue(0);
  
  // Game state refs - stored in refs to avoid dependency issues
  const gameStateRef = useRef<GameState>('idle');
  const gameSpeed = useRef(GAME_SPEED_INITIAL);
  const lastObstacleTime = useRef(0);
  const obstacleIdCounter = useRef(0);
  const currentScoreRef = useRef(0);
  const velocity = useRef(0);
  const isPlaying = useRef(false);
  const isJumping = useRef(false);
  const playerYValue = useRef(0);

  const playerLeft = 60;
  const playerRight = playerLeft + PLAYER_SIZE;
  const groundTop = SCREEN_HEIGHT - GROUND_HEIGHT;

  // Update gameStateRef when gameState changes
  useEffect(() => {
    gameStateRef.current = gameState;
    isPlaying.current = gameState === 'playing';
  }, [gameState]);

  // Sync playerY with playerYValue
  useEffect(() => {
    playerY.value = playerYValue.current;
  });

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    setHighScore((prev) => Math.max(prev, currentScoreRef.current));
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    currentScoreRef.current = 0;
    gameSpeed.current = GAME_SPEED_INITIAL;
    lastObstacleTime.current = 0;
    obstacleIdCounter.current = 0;
    velocity.current = 0;
    playerYValue.current = 0;
    isJumping.current = false;
    setObstacles([]);
    isPlaying.current = true;
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setObstacles([]);
    playerYValue.current = 0;
    velocity.current = 0;
    isJumping.current = false;
    gameSpeed.current = GAME_SPEED_INITIAL;
    obstacleIdCounter.current = 0;
    startGame();
  }, [startGame]);

  // Main game action
  const jump = useCallback(() => {
    if (gameStateRef.current === 'idle') {
      startGame();
      return;
    }
    if (gameStateRef.current === 'gameover') {
      resetGame();
      return;
    }
    if (!isJumping.current) {
      velocity.current = -18;
      isJumping.current = true;
    }
  }, [startGame, resetGame]);

  // Game loop using useEffect + setInterval
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      if (!isPlaying.current) return;

      // Apply gravity
      velocity.current += 0.8;
      playerYValue.current -= velocity.current;

      // Ground collision
      if (playerYValue.current <= 0) {
        playerYValue.current = 0;
        velocity.current = 0;
        isJumping.current = false;
      }

      // Update game speed
      gameSpeed.current += 0.001;

      // Spawn obstacles
      const currentTime = Date.now();
      const spawnInterval = Math.max(800, 1500 - gameSpeed.current * 50);
      
      if (currentTime - lastObstacleTime.current > spawnInterval) {
        lastObstacleTime.current = currentTime;
        
        const newId = obstacleIdCounter.current++;
        const newX = SCREEN_WIDTH + 50;
        const newHeight = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
        
        setObstacles(prev => [...prev, { id: newId, x: newX, height: newHeight }]);
      }

      // Update obstacle positions
      setObstacles(prev => {
        const updated = prev
          .map(obs => ({ ...obs, x: obs.x - gameSpeed.current }))
          .filter(obs => obs.x > -OBSTACLE_WIDTH);

        // Check collision
        const playerBottom = groundTop - playerYValue.current;
        const playerTop = playerBottom - PLAYER_SIZE;
        const playerLeftVal = playerLeft + 4;
        const playerRightVal = playerRight - 4;

        for (const obs of updated) {
          const obsLeft = obs.x + 4;
          const obsRight = obs.x + OBSTACLE_WIDTH - 4;
          const obsTop = groundTop - obs.height;

          if (
            playerRightVal > obsLeft &&
            playerLeftVal < obsRight &&
            playerBottom > obsTop + 4 &&
            playerTop < groundTop
          ) {
            isPlaying.current = false;
            handleGameOver();
            return updated;
          }
        }

        return updated;
      });

      // Update score
      const newScore = Math.floor(gameSpeed.current * 10);
      currentScoreRef.current = newScore;
      setScore(newScore);

    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [gameState, groundTop, playerLeft, playerRight, handleGameOver]);

  // Animated style for player
  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -playerY.value }],
  }));

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

        {/* Game Canvas */}
        <Pressable style={styles.canvas} onPress={jump}>
          {/* Game elements */}
          {gameState === 'playing' && (
            <>
              {/* Player */}
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

              {/* Obstacles */}
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

          {/* Start Screen */}
          {gameState === 'idle' && (
            <View style={styles.overlay}>
              <Text style={styles.title}>PIXEL RUN</Text>
              <Text style={styles.subtitle}>TAP TO START</Text>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>Tap or Press to Jump</Text>
              </View>
            </View>
          )}

          {/* Game Over Screen */}
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

      {/* Controls hint */}
      <View style={styles.controlsHint}>
        <Text style={styles.hintText}>TAP TO JUMP</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
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
    color: GAME_COLORS.dimWhite,
    letterSpacing: 2,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: GAME_COLORS.accent,
    textShadowColor: GAME_COLORS.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  highScoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: GAME_COLORS.neonPurple,
    textShadowColor: GAME_COLORS.neonPurple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  canvas: {
    flex: 1,
    backgroundColor: GAME_COLORS.background,
  },
  playerContainer: {
    position: 'absolute',
    left: 60,
  },
  playerGlowOuter: {
    shadowColor: GAME_COLORS.neonPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  playerGlowInner: {
    shadowColor: GAME_COLORS.player,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  playerBody: {
    backgroundColor: GAME_COLORS.background,
    borderWidth: 2,
    borderColor: GAME_COLORS.player,
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
    backgroundColor: GAME_COLORS.player,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: GAME_COLORS.accent,
    textShadowColor: GAME_COLORS.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: GAME_COLORS.white,
    marginTop: 20,
    letterSpacing: 4,
  },
  instructionBox: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: GAME_COLORS.neonPurple,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 14,
    color: GAME_COLORS.dimWhite,
    letterSpacing: 1,
  },
  gameOverText: {
    fontSize: 40,
    fontWeight: '900',
    color: GAME_COLORS.warning,
    textShadowColor: GAME_COLORS.warning,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 4,
  },
  finalScoreBox: {
    marginTop: 30,
    alignItems: 'center',
  },
  finalScoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: GAME_COLORS.dimWhite,
    letterSpacing: 2,
  },
  finalScoreValue: {
    fontSize: 56,
    fontWeight: '900',
    color: GAME_COLORS.white,
    textShadowColor: GAME_COLORS.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  newRecordText: {
    fontSize: 16,
    fontWeight: '700',
    color: GAME_COLORS.neonPurple,
    marginTop: 10,
    letterSpacing: 2,
    textShadowColor: GAME_COLORS.neonPurple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  tapToRestart: {
    fontSize: 16,
    fontWeight: '600',
    color: GAME_COLORS.dimWhite,
    marginTop: 40,
    letterSpacing: 2,
  },
  controlsHint: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: GAME_COLORS.ground,
  },
  hintText: {
    fontSize: 11,
    fontWeight: '500',
    color: GAME_COLORS.dimWhite,
    letterSpacing: 1,
  },
});
