/* eslint-disable @typescript-eslint/no-unused-vars */
declare module "maplibre-gl-draw" {
  import type { IControl, Map } from "maplibre-gl";

  interface DrawCreateEvent {
    features: GeoJSON.Feature[];
    type: "draw.create";
  }

  interface DrawUpdateEvent {
    features: GeoJSON.Feature[];
    action: string;
    type: "draw.update";
  }

  interface DrawDeleteEvent {
    features: GeoJSON.Feature[];
    type: "draw.delete";
  }

  interface DrawSelectionChangeEvent {
    features: GeoJSON.Feature[];
    type: "draw.selectionchange";
  }

  interface DrawModeChangeEvent {
    mode: string;
    type: "draw.modechange";
  }

  interface DrawOptions {
    displayControlsDefault?: boolean;
    controls?: {
      point?: boolean;
      line_string?: boolean;
      polygon?: boolean;
      trash?: boolean;
      combine_features?: boolean;
      uncombine_features?: boolean;
      srmode?: boolean;
    };
    defaultMode?: string;
    modes?: Record<string, unknown>;
    styles?: Record<string, unknown>[];
    userProperties?: boolean;
  }

  class MapboxDraw implements IControl {
    constructor(options?: DrawOptions);
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
    getDefaultPosition(): string;
    changeMode(mode: string, options?: { featureId?: string }): void;
    getAll(): GeoJSON.FeatureCollection;
    set(featureCollection: GeoJSON.FeatureCollection): void;
    add(geojson: GeoJSON.Feature): void;
    get(featureId: string): GeoJSON.Feature | undefined;
    getFeatureIdsAt(point: { x: number; y: number }): string[];
    getSelectedIds(): string[];
    getSelected(): GeoJSON.FeatureCollection;
    getSelectedPoints(): GeoJSON.FeatureCollection;
    delete(featureIds: string | string[]): void;
    deleteAll(): void;
    setFeatureProperty(
      featureId: string,
      property: string,
      value: unknown
    ): void;
    trash(): void;
    clearSelected(): void;
  }

  const MapboxDraw: {
    new (options?: DrawOptions): MapboxDraw;
  };

  export default MapboxDraw;
}
