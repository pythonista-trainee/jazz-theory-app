"use client";

import { useState, useEffect, type RefObject } from "react";

/**
 * Returns the content width of `ref` in pixels, updating on resize.
 * Returns 0 until the first measurement completes.
 */
export function useContainerWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = (w: number) => setWidth(Math.floor(w));
    update(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => update(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}
