// hooks/useFrameworkReady.ts
import { useEffect } from 'react';

export function useFrameworkReady() {
  useEffect(() => {
    try {
      // Works on both React Native (globalThis) and Web
      const g: any = globalThis as any;
      if (typeof g?.frameworkReady === 'function') {
        g.frameworkReady();
      }
    } catch (e) {
      console.warn('useFrameworkReady failed to call frameworkReady:', e);
    }
  }, []);
}

export default useFrameworkReady;