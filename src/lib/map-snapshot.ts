/**
 * Capture the MapLibre GL canvas as a base64 PNG data URL.
 *
 * Works by triggering a map re-render and reading the canvas
 * synchronously inside the `render` event — before the browser
 * swaps the WebGL drawing buffer.
 */
export function captureMapSnapshot(): Promise<string | null> {
  const canvas = document.querySelector<HTMLCanvasElement>(".maplibregl-canvas");
  if (!canvas) return Promise.resolve(null);

  // Access the map instance via global reference (set by map-container)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = (window as any).__solarcast_map;

  if (!map || typeof map.once !== "function") {
    return Promise.resolve(tryCapture(canvas));
  }

  return new Promise<string | null>((resolve) => {
    let resolved = false;

    const done = (result: string | null) => {
      if (resolved) return;
      resolved = true;
      resolve(result);
    };

    map.once("render", () => {
      done(tryCapture(canvas));
    });

    // Timeout safety — fallback to direct capture
    setTimeout(() => done(tryCapture(canvas)), 1500);

    map.triggerRepaint();
  });
}

function tryCapture(canvas: HTMLCanvasElement): string | null {
  try {
    const dataUrl = canvas.toDataURL("image/png");
    if (!dataUrl || dataUrl === "data:," || dataUrl.length < 500) {
      return null;
    }
    return dataUrl;
  } catch {
    return null;
  }
}
