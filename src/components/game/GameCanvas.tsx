import React, { useEffect, useRef, useState } from "react";
import { Bird } from "./Bird";
import { Candlestick } from "./Candlestick";
import { GameOverlay } from "./GameOverlay";
import { FoamNet } from "./FoamNet";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSound } from "@/hooks/use-sound";
import { useBackground } from "@/hooks/use-background";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

const GRAVITY = 0.5;
const EASY_GRAVITY = 0.3;
const JUMP_FORCE = -10;
const EASY_JUMP_FORCE = -8;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const CANDLESTICK_GAP = 200;
const CANDLESTICK_SPEED = 3;
const INITIAL_CANDLESTICK_X = GAME_WIDTH;
const CANDLESTICK_SPAWN_INTERVAL = 100;
const EASY_SCORE_INTERVAL = 100;
const NORMAL_SCORE_INTERVAL = 50;
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
  const [isMuted, setIsMuted] = useState(false);
  const [isEasyMode, setIsEasyMode] = useState(false);
  
  const gameLoopRef = useRef<number>();
  const frameCountRef = useRef(0);

  // Sound hooks
  const backgroundMusic = useSound('/audio/background-music.mp3', { loop: true, volume: 0.5 });
  const jumpSound = useSound('/audio/jump.mp3', { volume: 0.4 });
  const gameOverSound = useSound('/audio/game-over.mp3', { volume: 0.4 });

  const { backgroundImage, isTransitioning } = useBackground(score);

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
    setBirdVelocity(isEasyMode ? EASY_JUMP_FORCE : JUMP_FORCE);
    if (!isMuted) jumpSound.play();
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

      if (hasStartedMoving) {
        const gravity = isEasyMode ? EASY_GRAVITY : GRAVITY;
        const newBirdY = Math.min(Math.max(birdPos.y + birdVelocity, 0), GAME_HEIGHT - BIRD_SIZE);
        setBirdPos((prev) => ({
          ...prev,
          y: newBirdY,
        }));

        if (newBirdY >= GAME_HEIGHT - BIRD_SIZE) {
          setGameOver(true);
          setHighScore((prev) => Math.max(prev, score));
          if (!isMuted) gameOverSound.play();
          toast({
            title: "Get Wrapped!",
            description: `Score: ${score}`,
            variant: "destructive",
          });
          return;
        }

        setBirdVelocity((prev) => prev + gravity);
        setBirdRotation(birdVelocity * 4);

        const scoreInterval = isEasyMode ? EASY_SCORE_INTERVAL : NORMAL_SCORE_INTERVAL;
        if (frameCountRef.current % scoreInterval === 0) {
          setScore((prev) => prev + 1);
        }

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
            if (!isMuted) gameOverSound.play();
            toast({
              title: "Get Wrapped!",
              description: `Score: ${score}`,
              variant: "destructive",
            });
            return;
          }
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
  }, [gameStarted, gameOver, birdPos, birdVelocity, candlesticks, score, hasStartedMoving, isEasyMode]);

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

  // Update volume when mute state changes
  useEffect(() => {
    const volume = isMuted ? 0 : 0.5;
    backgroundMusic.setVolume(volume);
    jumpSound.setVolume(volume * 0.6);
    gameOverSound.setVolume(volume * 0.8);
  }, [isMuted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent game from starting/jumping
    setIsMuted(!isMuted);
  };

  const toggleDifficulty = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent game from starting/jumping
    setIsEasyMode(!isEasyMode);
    toast({
      title: !isEasyMode ? "Easy Mode Activated" : "Normal Mode Activated",
      description: !isEasyMode ? "Slower falling, easier scoring" : "Standard game speed",
    });
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-xl mx-auto touch-none"
      style={{ 
        width: GAME_WIDTH, 
        height: GAME_HEIGHT,
        maxWidth: '100vw',
        maxHeight: '80vh',
        aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'filter 0.5s ease-in-out',
        filter: isTransitioning ? 'brightness(150%)' : 'brightness(100%)',
      }}
      onClick={handleCanvasClick}
    >
      {/* Control buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={`w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm ${
            isEasyMode ? 'border-green-400' : ''
          }`}
          onClick={toggleDifficulty}
        >
          {isEasyMode ? 'E' : 'N'}
        </Button>
      </div>

      {/* Score display */}
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
          isEasyMode={isEasyMode}
        />
      )}
    </div>
  );
};