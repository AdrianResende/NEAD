import { useSyncExternalStore } from "react";

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

export function useMediaQuery(breakpoint: Breakpoint = "md"): boolean {
  const mediaQuery = `(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`;

  const subscribe = (onStoreChange: () => void) => {
    if (typeof window === "undefined") return () => undefined;

    const query = window.matchMedia(mediaQuery);
    const handler = () => onStoreChange();
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  };

  const getSnapshot = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(mediaQuery).matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
