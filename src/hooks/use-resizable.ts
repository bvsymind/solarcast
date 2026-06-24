"use client";

import { useCallback, useRef, useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

interface UseResizableOptions {
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  storageKey: string;
  /** Invert delta — for right-side panels where drag-right = narrower */
  invert?: boolean;
}

export function useResizable({
  defaultWidth,
  minWidth,
  maxWidth,
  storageKey,
  invert = false,
}: UseResizableOptions) {
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const startRef = useRef({ x: 0, w: 0 });

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setWidth(Number(saved));
  }, [storageKey]);

  // Persist width
  useEffect(() => {
    localStorage.setItem(storageKey, String(width));
  }, [width, storageKey]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startRef.current = { x: e.clientX, w: width };
    },
    [width]
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const rawDelta = e.clientX - startRef.current.x;
      const delta = invert ? -rawDelta : rawDelta;
      const next = Math.min(maxWidth, Math.max(minWidth, startRef.current.w + delta));
      setWidth(next);
    };

    const onMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Prevent text selection while dragging
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, minWidth, maxWidth, invert]);

  return { width, isDragging, onMouseDown };
}
