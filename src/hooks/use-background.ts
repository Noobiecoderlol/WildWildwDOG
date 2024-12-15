import { useEffect, useState } from 'react';

const SCORE_THRESHOLD = 20;

const backgrounds = [
  '/backgrounds/snowy.png',
  '/backgrounds/beach.png',
  '/backgrounds/neighborhood.png',
  '/backgrounds/universe.png',
  '/backgrounds/inferno.png',
  '/backgrounds/lastlevel.png',
];

export const useBackground = (score: number) => {
  const [currentBackground, setCurrentBackground] = useState(backgrounds[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const backgroundIndex = Math.min(
      Math.floor(score / SCORE_THRESHOLD),
      backgrounds.length - 1
    );
    
    const targetBackground = backgrounds[backgroundIndex];
    
    if (targetBackground !== currentBackground) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentBackground(targetBackground);
        setIsTransitioning(false);
      }, 500); // Half second transition
      
      return () => clearTimeout(timer);
    }
  }, [score, currentBackground]);

  return {
    backgroundImage: currentBackground,
    isTransitioning,
  };
}; 