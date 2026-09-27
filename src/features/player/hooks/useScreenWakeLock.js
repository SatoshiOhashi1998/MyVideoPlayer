import { useEffect, useRef } from 'react';

export function useScreenWakeLock(enabled) {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) {
      return;
    }

    let cancelled = false;

    const requestWakeLock = async () => {
      try {
        const wakeLock = await navigator.wakeLock.request('screen');

        if (cancelled) {
          await wakeLock.release();
          return;
        }

        wakeLockRef.current = wakeLock;

        wakeLock.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch (error) {
        console.warn('Failed to acquire screen wake lock:', error);
      }
    };

    requestWakeLock();

    return () => {
      cancelled = true;

      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) {
      return;
    }

    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === 'visible' &&
        !wakeLockRef.current
      ) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (error) {
          console.warn('Failed to reacquire screen wake lock:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [enabled]);
}
