// Performance optimization utilities
import { useCallback, useRef } from 'react';

// Debounce hook for search inputs and API calls
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
};

// Throttle hook for scroll events and frequent updates
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Image optimization helper
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality: number = 75
): string => {
  if (!url) return '';
  
  // For Next.js Image optimization
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  
  return `/_next/image?url=${encodeURIComponent(url)}&${params.toString()}`;
};

// Lazy loading intersection observer
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Memory usage monitoring (development only)
export const logMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memInfo = (performance as any).memory;
    console.log({
      usedJSHeapSize: `${(memInfo.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      totalJSHeapSize: `${(memInfo.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(memInfo.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
  }
};

// Bundle size analyzer helper
export const analyzeComponentSize = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Loading component: ${componentName}`);
    logMemoryUsage();
  }
};
