import React from "react";
import { Button } from "@/components/ui/button";

interface GameOverlayProps {
  score: number;
  highScore: number;
  isGameOver: boolean;
  onStart: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ score, highScore, isGameOver, onStart }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="text-center space-y-4 p-8 rounded-lg bg-white/10 backdrop-blur-md">
        <h1 className="text-4xl font-bold text-white mb-4">
          {isGameOver ? "Get Wrapped!" : "Wild Wild wDOG"}
        </h1>
        {isGameOver && (
          <div className="space-y-2 mb-6">
            <p className="text-2xl text-white">Score: {score}</p>
            <p className="text-xl text-white/80">High Score: {highScore}</p>
          </div>
        )}
        <Button
          onClick={onStart}
          className="px-8 py-4 bg-game-bird hover:bg-game-bird/90 text-white rounded-full text-lg transition-all duration-200 transform hover:scale-105"
        >
          {isGameOver ? "Play Again" : "Start Game"}
        </Button>
      </div>
    </div>
  );
};