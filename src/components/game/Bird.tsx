import React from "react";

interface BirdProps {
  position: { x: number; y: number };
  rotation: number;
}

export const Bird: React.FC<BirdProps> = ({ position, rotation }) => {
  return (
    <div
      className="absolute w-6 h-6 bg-game-bird rounded-full animate-bird-float"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.1s ease-out",
      }}
    >
      <div className="absolute right-0 top-1/2 w-2 h-2 bg-white rounded-full transform -translate-y-1/2" />
    </div>
  );
};