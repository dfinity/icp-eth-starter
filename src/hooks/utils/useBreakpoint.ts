import { useState, useEffect } from 'react';

export const useBreakpoint = () => {
  const [size, setSize] = useState<'xs' | 'sm' | 'md' | 'lg'>('xs');

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1200) {
        setSize('lg');
      } else if (window.innerWidth >= 768) {
        setSize('md');
      } else if (window.innerWidth >= 640) {
        setSize('sm');
      } else {
        setSize('xs');
      }
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return size;
};
