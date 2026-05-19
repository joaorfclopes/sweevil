import { useEffect } from 'react';

export default function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.setProperty('--scroll-lock-offset', `${scrollbarWidth}px`);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.removeProperty('--scroll-lock-offset');
    };
  }, [active]);
}
