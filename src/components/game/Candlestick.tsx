import React from "react";

interface CandlestickProps {
  position: { x: number; y: number };
  height: number;
  isBullish: boolean;
}

export const Candlestick: React.FC<CandlestickProps> = ({ position, height, isBullish }) => {
  return (
    <div
      className={`absolute w-16 ${isBullish ? "bg-game-bullish" : "bg-game-bearish"}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        height: `${height}px`,
        transition: "left 0.1s linear",
      }}
    >
      <div className="absolute w-2 left-1/2 -translate-x-1/2 bg-current" style={{ height: "100vh" }} />
    </div>
  );
};