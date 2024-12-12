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
      className={`absolute inset-0 pointer-events-none transition-all duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transform: `scale(${scale})`,
        animation: isVisible ? 'netWrap 0.7s forwards' : 'none',
      }}
    >
      {/* Diamond pattern mesh */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.9) 49%, rgba(255,255,255,0.9) 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(255,255,255,0.9) 49%, rgba(255,255,255,0.9) 51%, transparent 52%)
          `,
          backgroundSize: '30px 30px',
          backgroundPosition: 'center',
          filter: 'blur(0.5px)',
          transform: 'scale(1.1)',
          opacity: 0.9,
        }}
      />
      
      {/* Stretched effect when catching */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.5) 49%, rgba(255,255,255,0.5) 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(255,255,255,0.5) 49%, rgba(255,255,255,0.5) 51%, transparent 52%)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: 'center',
          animation: isVisible ? 'stretchNet 0.7s forwards' : 'none',
          opacity: 0.7,
        }}
      />

      <style>
        {`
          @keyframes netWrap {
            0% {
              clip-path: circle(0% at center);
            }
            70% {
              clip-path: circle(100% at center);
              transform: scale(1.2) rotate(0deg);
            }
            100% {
              clip-path: circle(150% at center);
              transform: scale(1) rotate(5deg);
            }
          }

          @keyframes stretchNet {
            0% {
              transform: scale(0.8) rotate(0deg);
            }
            50% {
              transform: scale(1.3) rotate(-3deg);
            }
            100% {
              transform: scale(1.1) rotate(5deg);
            }
          }
        `}
      </style>
    </div>
  );
}; 