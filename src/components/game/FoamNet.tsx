import React, { useEffect, useState } from 'react';

interface FoamNetProps {
  isVisible: boolean;
}

export const FoamNet: React.FC<FoamNetProps> = ({ isVisible }) => {
  const [scale, setScale] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setScale(1);
    } else {
      setScale(0);
    }
  }, [isVisible]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transform: `scale(${scale})`,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.9) 10%, transparent 60%)`,
        backgroundSize: '50px 50px',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        animation: isVisible ? 'netWrap 0.5s forwards' : 'none',
      }}
    >
      <style>
        {`
          @keyframes netWrap {
            0% {
              clip-path: circle(0% at center);
              backdrop-filter: blur(0px);
            }
            100% {
              clip-path: circle(150% at center);
              backdrop-filter: blur(4px);
            }
          }
        `}
      </style>
    </div>
  );
}; 