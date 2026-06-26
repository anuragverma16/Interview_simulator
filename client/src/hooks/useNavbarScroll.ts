import { useEffect, useRef, useState } from 'react';

const SCROLL_DELTA = 10;
const TOP_THRESHOLD = 48;

export function useNavbarScroll() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 16);

        if (y <= TOP_THRESHOLD) {
          setHidden(false);
        } else if (y - lastY.current > SCROLL_DELTA) {
          setHidden(true);
        } else if (lastY.current - y > SCROLL_DELTA) {
          setHidden(false);
        }

        lastY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { hidden, scrolled };
}
