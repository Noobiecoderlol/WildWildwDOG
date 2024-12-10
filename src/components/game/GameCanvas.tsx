import React, { useEffect, useRef, useState } from "react";
import { Bird } from "./Bird";
import { Candlestick } from "./Candlestick";
import { GameOverlay } from "./GameOverlay";
import { useToast } from "@/components/ui/use-toast";

const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const CANDLESTICK_GAP = 200;
const CANDLESTICK_SPEED = 3;

export const GameCanvas: React.FC = () => {
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [birdPos, setBirdPos] = useState({ x: 100, y: GAME_HEIGHT / 2 });
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [birdRotation, setBirdRotation] = useState(0);
  const [candlesticks, setCandlesticks] = useState<Array<{ x: number; y: number; height: number; isBullish: boolean }>>([]);
  
  const gameLoopRef = useRef<number>();
  const frameCountRef = useRef(0);

  const resetGame = () => {
    setBirdPos({ x: 100, y: GAME_HEIGHT / 2 });
    setBirdVelocity(0);
    setBirdRotation(0);
    setCandlesticks([]);
    setScore(0);
    setGameOver(false);
    frameCountRef.current = 0;
  };

  const startGame = () => {
    resetGame();
    setGameStarted(true);
    toast({
      title: "Game Started!",
      description: "Press spacebar or click to jump",
    });
  };

  const handleJump = () => {
    if (!gameStarted || gameOver) return;
    setBirdVelocity(JUMP_FORCE);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        handleJump();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = () => {
      frameCountRef.current += 1;

      // Update bird position and rotation
      setBirdPos((prev) => ({
        ...prev,
        y: Math.min(Math.max(prev.y + birdVelocity, 0), GAME_HEIGHT),
      }));
      setBirdVelocity((prev) => prev + GRAVITY);
      setBirdRotation(birdVelocity * 4);

      // Generate new candlesticks
      if (frameCountRef.current % 100 === 0) {
        setCandlesticks((prev) => {
          const newCandlesticks = [...prev];
          const height = Math.random() * (GAME_HEIGHT - CANDLESTICK_GAP - 100) + 50;
          newCandlesticks.push({
            x: GAME_WIDTH,
            y: 0,
            height,
            isBullish: Math.random() > 0.5,
          });
          return newCandlesticks;
        });
      }

      // Update candlesticks position
      setCandlesticks((prev) => {
        return prev
          .map((c) => ({ ...c, x: c.x - CANDLESTICK_SPEED }))
          .filter((c) => c.x > -50);
      });

      // Check collisions
      const birdRect = {
        x: birdPos.x,
        y: birdPos.y,
        width: 24,
        height: 24,
      };

      for (const candlestick of candlesticks) {
        const candlestickRect = {
          x: candlestick.x,
          y: candlestick.y,
          width: 64,
          height: candlestick.height,
        };

        if (
          birdRect.x < candlestickRect.x + candlestickRect.width &&
          birdRect.x + birdRect.width > candlestickRect.x &&
          birdRect.y < candlestickRect.y + candlestickRect.height &&
          birdRect.y + birdRect.height > candlestickRect.y
        ) {
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

      // Update score
      if (frameCountRef.current % 50 === 0) {
        setScore((prev) => prev + 1);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, birdPos, birdVelocity, candlesticks]);

  return (
    <div
      className="relative overflow-hidden bg-game-background rounded-lg shadow-xl mx-auto"
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      onClick={handleJump}
    >
      <div className="absolute top-4 left-4 text-2xl text-white font-bold z-10">
        {score}
      </div>
      
      <Bird position={birdPos} rotation={birdRotation} />
      
      {candlesticks.map((candlestick, index) => (
        <Candlestick
          key={index}
          position={{ x: candlestick.x, y: candlestick.y }}
          height={candlestick.height}
          isBullish={candlestick.isBullish}
        />
      ))}

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