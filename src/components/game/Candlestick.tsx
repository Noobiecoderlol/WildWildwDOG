import React from "react";

interface CandlestickProps {
  position: { x: number; y: number };
  height: number;
  isBullish: boolean;
}

export const Candlestick: React.FC<CandlestickProps> = ({ position, height, isBullish }) => {
  const bodyHeight = Math.min(height, 100); // Limit body height for visual consistency
  
  return (
    <div
      className={`absolute w-16 ${isBullish ? "bg-game-bullish" : "bg-game-bearish"}`}
      style={{
        left: `${position.x}px`,
        top: isBullish ? `${position.y + height - bodyHeight}px` : `${position.y}px`,
        height: `${bodyHeight}px`,
        transition: "left 0.1s linear",
      }}
    >
      {/* Line for bullish candlesticks (starts from bottom) */}
      {isBullish && (
        <div 
          className="absolute w-2 left-1/2 -translate-x-1/2 bg-current" 
          style={{ 
            top: `${bodyHeight}px`,
            height: `${Math.max(0, height - bodyHeight)}px`
          }} 
        />
      )}
      
      {/* Line for bearish candlesticks (starts from top) */}
      {!isBullish && (
        <div 
          className="absolute w-2 left-1/2 -translate-x-1/2 bg-current" 
          style={{ 
            bottom: `${bodyHeight}px`,
            height: `${Math.max(0, height - bodyHeight)}px`
          }} 
        />
      )}
    </div>
  );
};