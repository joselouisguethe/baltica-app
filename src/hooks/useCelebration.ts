import { useState, useCallback } from 'react';
import { CelebrationType } from '@/components/celebrations/CelebrationModal';

interface CelebrationState {
  isOpen: boolean;
  type: CelebrationType;
  streakCount: number;
  dayNumber: number;
}

export function useCelebration() {
  const [celebration, setCelebration] = useState<CelebrationState>({
    isOpen: false,
    type: 'day-complete',
    streakCount: 0,
    dayNumber: 0,
  });

  const triggerCelebration = useCallback((
    type: CelebrationType,
    options?: { streakCount?: number; dayNumber?: number }
  ) => {
    setCelebration({
      isOpen: true,
      type,
      streakCount: options?.streakCount || 0,
      dayNumber: options?.dayNumber || 0,
    });
  }, []);

  const closeCelebration = useCallback(() => {
    setCelebration(prev => ({ ...prev, isOpen: false }));
  }, []);

  const checkAndTriggerCelebration = useCallback((
    completedDays: number[],
    streak: number,
    currentDay: number,
    totalDays: number
  ) => {
    // Check for journey completion
    if (completedDays.length === totalDays) {
      triggerCelebration('journey-complete', { dayNumber: totalDays });
      return;
    }

    // Check for streak milestones
    if (streak === 21) {
      triggerCelebration('streak-21', { streakCount: streak });
      return;
    }
    if (streak === 14) {
      triggerCelebration('streak-14', { streakCount: streak });
      return;
    }
    if (streak === 7) {
      triggerCelebration('streak-7', { streakCount: streak });
      return;
    }
    if (streak === 3) {
      triggerCelebration('streak-3', { streakCount: streak });
      return;
    }

    // Check for halfway point
    if (completedDays.length === Math.floor(totalDays / 2)) {
      triggerCelebration('halfway', { dayNumber: currentDay });
      return;
    }

    // Default day completion celebration
    triggerCelebration('day-complete', { dayNumber: currentDay });
  }, [triggerCelebration]);

  return {
    celebration,
    triggerCelebration,
    closeCelebration,
    checkAndTriggerCelebration,
  };
}
