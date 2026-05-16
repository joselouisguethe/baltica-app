import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  title: string;
  subtitle?: string;
  duration: string;
  audioSrc?: string | null;
  onComplete?: () => void;
}

export function AudioPlayer({ title, subtitle, duration, audioSrc, onComplete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [totalDuration, setTotalDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (audioSrc) {
      audioRef.current = new Audio(audioSrc);

      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setTotalDuration(formatTime(audioRef.current.duration));
        }
      });

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(percent);
          setCurrentTime(formatTime(audioRef.current.currentTime));
        }
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(100);
        onComplete?.();
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [audioSrc, onComplete]);

  useEffect(() => {
    if (!audioSrc) {
      // Fallback: simulate playback if no audio source
      let interval: NodeJS.Timeout;
      if (isPlaying) {
        interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsPlaying(false);
              onComplete?.();
              return 100;
            }
            const newProgress = prev + 0.5;
            setCurrentTime(formatTime((newProgress / 100) * 300));
            return newProgress;
          });
        }, 150);
      }
      return () => clearInterval(interval);
    }
  }, [isPlaying, onComplete, audioSrc]);

  const togglePlay = () => {
    if (audioSrc && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const newProgress = value[0];
    setProgress(newProgress);

    if (audioSrc && audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    } else {
      setCurrentTime(formatTime((newProgress / 100) * 300));
    }
  };

  const skipBackward = () => {
    if (audioSrc && audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    } else {
      setProgress(prev => Math.max(0, prev - 10));
    }
  };

  const skipForward = () => {
    if (audioSrc && audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 10
      );
    } else {
      setProgress(prev => Math.min(100, prev + 10));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Visualization */}
      <div className="relative h-36 mb-4 flex items-center justify-center">
        {/* Animated circles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-primary/30"
            initial={{ width: 60, height: 60, opacity: 0.5 }}
            animate={isPlaying ? {
              width: [60 + i * 30, 90 + i * 45, 60 + i * 30],
              height: [60 + i * 30, 90 + i * 45, 60 + i * 30],
              opacity: [0.3, 0.1, 0.3],
            } : {}}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Center button */}
        <motion.button
          onClick={togglePlay}
          className="relative z-10 w-20 h-20 rounded-full gradient-warm flex items-center justify-center shadow-soft"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? (
            <Pause className="h-8 w-8 text-primary-foreground" />
          ) : (
            <Play className="h-8 w-8 text-primary-foreground ml-1" />
          )}
        </motion.button>
      </div>

      {/* Info */}
      <div className="text-center mb-3">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{currentTime}</span>
          <span>{totalDuration}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={skipBackward}
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          className="h-14 w-14 rounded-full"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-0.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={skipForward}
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
