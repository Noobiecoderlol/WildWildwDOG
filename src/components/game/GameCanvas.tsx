import React, { useEffect, useRef, useState } from "react";
import { Bird } from "./Bird";
import { Candlestick } from "./Candlestick";
import { GameOverlay } from "./GameOverlay";
import { FoamNet } from "./FoamNet";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSound } from "@/hooks/use-sound";

const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const CANDLESTICK_GAP = 200;
const CANDLESTICK_SPEED = 3;
const INITIAL_CANDLESTICK_X = GAME_WIDTH;
const CANDLESTICK_SPAWN_INTERVAL = 100;
const BIRD_SIZE = 24;
const CANDLESTICK_WIDTH = 64;
const WICK_WIDTH = 8;

export const GameCanvas: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [birdPos, setBirdPos] = useState({ x: 100, y: GAME_HEIGHT / 2 });
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [birdRotation, setBirdRotation] = useState(0);
  const [hasStartedMoving, setHasStartedMoving] = useState(false);
  const [candlesticks, setCandlesticks] = useState<Array<{ x: number; y: number; height: number; isBullish: boolean }>>([]);
  
  const gameLoopRef = useRef<number>();
  const frameCountRef = useRef(0);

  // Sound hooks
  const backgroundMusic = useSound('/audio/background-music.mp3', { loop: true, volume: 0.5 });
  const jumpSound = useSound('/audio/jump.mp3', { volume: 0.3 });
  const gameOverSound = useSound('/audio/game-over.mp3', { volume: 0.4 });

  const resetGame = () => {
    setBirdPos({ x: 100, y: GAME_HEIGHT / 2 });
    setBirdVelocity(0);
    setBirdRotation(0);
    setCandlesticks([]);
    setScore(0);
    setGameOver(false);
    setHasStartedMoving(false);
    frameCountRef.current = 0;
  };

  const startGame = () => {
    if (gameStarted && !gameOver) return;
    resetGame();
    setGameStarted(true);
    backgroundMusic.play();
    toast({
      title: "Game Started!",
      description: isMobile ? "Tap the screen to start flying" : "Press spacebar or click to start flying",
    });
  };

  const handleJump = () => {
    if (!gameStarted || gameOver) return;
    if (!hasStartedMoving) {
      setHasStartedMoving(true);
    }
    setBirdVelocity(JUMP_FORCE);
    jumpSound.play();
  };

  const spawnCandlestick = () => {
    const height = Math.random() * (GAME_HEIGHT - CANDLESTICK_GAP - 100) + 50;
    return {
      x: INITIAL_CANDLESTICK_X,
      y: 0,
      height,
      isBullish: Math.random() > 0.5,
    };
  };

  const checkCollision = (
    birdRect: { x: number; y: number; width: number; height: number },
    candlestick: { x: number; y: number; height: number; isBullish: boolean }
  ) => {
    const bodyHeight = Math.min(candlestick.height, 100);
    const wickHeight = Math.max(0, candlestick.height - bodyHeight);
    
    // Calculate body position and dimensions
    const bodyRect = {
      x: candlestick.x,
      width: CANDLESTICK_WIDTH,
      height: bodyHeight,
      y: candlestick.isBullish 
        ? GAME_HEIGHT - candlestick.y - bodyHeight 
        : candlestick.y
    };

    // Calculate wick position and dimensions
    const wickRect = {
      x: candlestick.x + (CANDLESTICK_WIDTH - WICK_WIDTH) / 2,
      width: WICK_WIDTH,
      height: wickHeight,
      y: candlestick.isBullish
        ? GAME_HEIGHT - candlestick.y - candlestick.height
        : candlestick.y + bodyHeight
    };

    // Check collision with body
    const bodyCollision = 
      birdRect.x < bodyRect.x + bodyRect.width &&
      birdRect.x + birdRect.width > bodyRect.x &&
      birdRect.y < bodyRect.y + bodyRect.height &&
      birdRect.y + birdRect.height > bodyRect.y;

    // Check collision with wick
    const wickCollision =
      birdRect.x < wickRect.x + wickRect.width &&
      birdRect.x + birdRect.width > wickRect.x &&
      birdRect.y < wickRect.y + wickRect.height &&
      birdRect.y + birdRect.height > wickRect.y;

    return bodyCollision || wickCollision;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!gameStarted || gameOver) {
          startGame();
        } else {
          handleJump();
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (!gameStarted || gameOver) {
        startGame();
      } else {
        handleJump();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    if (isMobile) {
      window.addEventListener("touchstart", handleTouchStart, { passive: false });
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      if (isMobile) {
        window.removeEventListener("touchstart", handleTouchStart);
      }
    };
  }, [gameStarted, gameOver, isMobile]);

  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const gameLoop = () => {
      frameCountRef.current += 1;

      // Only apply game physics and mechanics after the first jump
      if (hasStartedMoving) {
        // Bird physics
        const newBirdY = Math.min(Math.max(birdPos.y + birdVelocity, 0), GAME_HEIGHT - BIRD_SIZE);
        setBirdPos((prev) => ({
          ...prev,
          y: newBirdY,
        }));

        // Check if bird hits the bottom of the screen
        if (newBirdY >= GAME_HEIGHT - BIRD_SIZE) {
          setGameOver(true);
          setHighScore((prev) => Math.max(prev, score));
          toast({
            title: "Game Over!",
            description: `Score: ${score}`,
            variant: "destructive",
          });
          return;
        }

        setBirdVelocity((prev) => prev + GRAVITY);
        setBirdRotation(birdVelocity * 4);

        // Spawn and move candlesticks only after first jump
        if (frameCountRef.current % CANDLESTICK_SPAWN_INTERVAL === 0) {
          setCandlesticks((prev) => [...prev, spawnCandlestick()]);
        }

        setCandlesticks((prev) => {
          return prev
            .map((c) => ({
              ...c,
              x: c.x - CANDLESTICK_SPEED,
            }))
            .filter((c) => c.x > -64);
        });

        // Check collisions
        const birdRect = {
          x: birdPos.x,
          y: birdPos.y,
          width: BIRD_SIZE,
          height: BIRD_SIZE,
        };

        for (const candlestick of candlesticks) {
          if (checkCollision(birdRect, candlestick)) {
            setGameOver(true);
            setHighScore((prev) => Math.max(prev, score));
            toast({
              title: "Game Over!",
              description: `Score: ${score}`,
              variant: "destructive",
            });
            return;
          }
        }

        // Increment score
        if (frameCountRef.current % 50 === 0) {
          setScore((prev) => prev + 1);
        }
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, birdPos, birdVelocity, candlesticks, score, hasStartedMoving]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!gameStarted || gameOver) {
      startGame();
    } else {
      handleJump();
    }
  };

  useEffect(() => {
    if (gameOver) {
      backgroundMusic.pause();
      gameOverSound.play();
    }
  }, [gameOver]);

  // Cleanup sounds when component unmounts
  useEffect(() => {
    return () => {
      backgroundMusic.stop();
      jumpSound.stop();
      gameOverSound.stop();
    };
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-xl mx-auto touch-none"
      style={{ 
        width: GAME_WIDTH, 
        height: GAME_HEIGHT,
        maxWidth: '100vw',
        maxHeight: '80vh',
        aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
        backgroundColor: '#87CEEB'
      }}
      onClick={handleCanvasClick}
    >
      <div className="absolute top-4 left-4 text-2xl text-white font-bold z-10">
        {score}
      </div>
      
      <Bird position={birdPos} rotation={birdRotation} />
      
      {candlesticks.map((candlestick, index) => (
        <Candlestick
          key={`${index}-${candlestick.x}`}
          position={{ x: candlestick.x, y: candlestick.y }}
          height={candlestick.height}
          isBullish={candlestick.isBullish}
        />
      ))}

      <FoamNet isVisible={gameOver} />

      {(!gameStarted || gameOver) && (
        <GameOverlay
          score={score}
          highScore={highScore}
          isGameOver={gameOver}
          onStart={startGame}
        />
      )}
    </div>
  );
};