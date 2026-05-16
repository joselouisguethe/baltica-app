import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityOptions {
  timeout: number; // milliseconds before triggering inactivity
  onInactive: () => void; // callback when user becomes inactive
  enabled?: boolean; // whether to track inactivity (default: true)
}

interface UseInactivityReturn {
  resetTimer: () => void;
}

export function useInactivity({
  timeout,
  onInactive,
  enabled = true,
}: UseInactivityOptions): UseInactivityReturn {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onInactiveRef = useRef(onInactive);

  // Keep callback ref updated
  useEffect(() => {
    onInactiveRef.current = onInactive;
  }, [onInactive]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    if (enabled) {
      timeoutRef.current = setTimeout(() => {
        onInactiveRef.current();
      }, timeout);
    }
  }, [clearTimer, enabled, timeout]);

  const resetTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    const handleActivity = () => {
      resetTimer();
    };

    // Start timer initially
    startTimer();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimer();
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, clearTimer, startTimer, resetTimer]);

  return { resetTimer };
}
