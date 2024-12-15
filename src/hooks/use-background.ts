import { useEffect, useState } from 'react';

const SCORE_THRESHOLD = 20;
const TRANSITION_DURATION = 400; // Reduced from 1000ms to 400ms

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
  const [previousBackground, setPreviousBackground] = useState(backgrounds[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  useEffect(() => {
    const backgroundIndex = Math.min(
      Math.floor(score / SCORE_THRESHOLD),
      backgrounds.length - 1
    );
    
    const targetBackground = backgrounds[backgroundIndex];
    
    if (targetBackground !== currentBackground) {
      setPreviousBackground(currentBackground);
      setCurrentBackground(targetBackground);
      setIsTransitioning(true);
      setTransitionProgress(0);

      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
        
        setTransitionProgress(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsTransitioning(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [score, currentBackground]);

  return {
    currentBackground,
    previousBackground,
    isTransitioning,
    transitionProgress,
    style: {
      backgroundImage: isTransitioning 
        ? `url(${previousBackground}), url(${currentBackground})`
        : `url(${currentBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'all 0.2s ease-in-out',
      filter: `blur(${isTransitioning ? (Math.sin(transitionProgress * Math.PI) * 3) : 0}px)`,
      opacity: isTransitioning 
        ? Math.cos(transitionProgress * Math.PI / 2)
        : 1,
    }
  };
}; 