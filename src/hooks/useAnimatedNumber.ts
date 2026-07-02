import { useState, useEffect } from 'react';

/**
 * Animates a numeric value from its previous state to a new target value.
 * Uses ease-out quadratic easing over 400ms.
 * Extracted as a shared hook to avoid duplication across pages.
 */
export function useAnimatedNumber(value: number): number {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 400;
    const startTime = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); // ease-out quad
      setDisplayValue(Math.round(start + (end - start) * ease));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return displayValue;
}
