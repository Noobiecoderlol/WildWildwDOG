import React from "react";

interface BirdProps {
  position: { x: number; y: number };
  rotation: number;
}

export const Bird: React.FC<BirdProps> = ({ position, rotation }) => {
  return (
    <div
      className="absolute w-6 h-6 animate-bird-float"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.1s ease-out",
        backgroundImage: `url('/dog-logo.png')`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
};