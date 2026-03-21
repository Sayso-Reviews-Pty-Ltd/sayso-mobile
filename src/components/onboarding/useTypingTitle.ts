import { useEffect, useState } from 'react';

export function useTypingTitle(
  title: string,
  titleTyping: boolean,
  titleTypingDelayMs: number,
  titleTypingSpeedMs: number,
  reducedMotion: boolean,
): string {
  const [displayTitle, setDisplayTitle] = useState(titleTyping ? '' : title);

  useEffect(() => {
    if (!titleTyping || reducedMotion) {
      setDisplayTitle(title);
      return;
    }

    setDisplayTitle('');
    let charIndex = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        charIndex += 1;
        setDisplayTitle(title.slice(0, charIndex));
        if (charIndex >= title.length && intervalId) {
          clearInterval(intervalId);
        }
      }, titleTypingSpeedMs);
    }, titleTypingDelayMs);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [reducedMotion, title, titleTyping, titleTypingDelayMs, titleTypingSpeedMs]);

  return displayTitle;
}
