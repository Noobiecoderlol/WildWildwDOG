import { useEffect, useRef, useState } from 'react';

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

export const useSound = (soundUrl: string, options: SoundOptions = {}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(soundUrl);
    audio.volume = options.volume ?? 1;
    audio.loop = options.loop ?? false;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [soundUrl, options.volume, options.loop]);

  const play = () => {
    if (audioRef.current) {
      // Reset the audio to start if it was already playing
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  return {
    play,
    pause,
    stop,
    setVolume,
    isPlaying
  };
}; 