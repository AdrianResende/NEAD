import { useState, useEffect } from "react";

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Retorna true quando a largura da janela está abaixo do breakpoint informado.
 */
export function useMediaQuery(breakpoint: Breakpoint = "md"): boolean {
  const [isBelow, setIsBelow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`);
    setIsBelow(query.matches);

    const handler = (e: MediaQueryListEvent) => setIsBelow(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, [breakpoint]);

  return isBelow;
}
