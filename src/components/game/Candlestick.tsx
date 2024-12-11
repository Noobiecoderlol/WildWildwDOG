import React from "react";

interface CandlestickProps {
  position: { x: number; y: number };
  height: number;
  isBullish: boolean;
}

export const Candlestick: React.FC<CandlestickProps> = ({ position, height, isBullish }) => {
  const bodyHeight = Math.min(height, 100); // Limit body height for visual consistency
  const wickHeight = Math.max(0, height - bodyHeight);
  
  return (
    <div
      className={`absolute w-16 ${isBullish ? "bg-game-bullish" : "bg-game-bearish"}`}
      style={{
        left: `${position.x}px`,
        bottom: isBullish ? `${position.y}px` : 'auto',
        top: !isBullish ? `${position.y}px` : 'auto',
        height: `${bodyHeight}px`,
        transition: "left 0.1s linear",
      }}
    >
      {/* Wick for bullish candlesticks (extends upward from body) */}
      {isBullish && (
        <div 
          className="absolute w-2 left-1/2 -translate-x-1/2 bg-current" 
          style={{ 
            bottom: `${bodyHeight}px`,
            height: `${wickHeight}px`
          }} 
        />
      )}
      
      {/* Wick for bearish candlesticks (extends downward from body) */}
      {!isBullish && (
        <div 
          className="absolute w-2 left-1/2 -translate-x-1/2 bg-current" 
          style={{ 
            top: `${bodyHeight}px`,
            height: `${wickHeight}px`
          }} 
        />
      )}
    </div>
  );
};