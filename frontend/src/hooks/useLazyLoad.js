import { useEffect, useRef, useState } from 'react';

export function useLazyLoad(rootMargin = '300px', initialValue = false) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(initialValue);

  useEffect(() => {
    if (initialValue) return;
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, initialValue]);

  return [containerRef, inView];
}
