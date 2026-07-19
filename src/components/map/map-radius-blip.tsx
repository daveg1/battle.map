import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import type { Point } from "../../types/common";

const BLIP_DURATION_MS = 800;
const BLIP_MIN_RADIUS = 8;
const BLIP_MAX_RADIUS = 42;
const BLIP_MAX_OPACITY = 0.7;
const MAX_ACTIVE_BLIPS = 30;

interface BlipItem {
  id: number;
  point: Point;
  startedAt: number;
}

interface Props {
  point: Point | null;
}

export function MapRadiusBlip({ point }: Props) {
  const [blips, setBlips] = useState<BlipItem[]>([]);
  const [frameTime, setFrameTime] = useState(0);
  const hasInitialized = useRef(false);
  const nextBlipId = useRef(1);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    if (!point) {
      return;
    }

    const startedAt = performance.now();
    const id = nextBlipId.current;
    nextBlipId.current += 1;

    setBlips((current) => {
      const next = [...current, { id, point, startedAt }];
      if (next.length <= MAX_ACTIVE_BLIPS) {
        return next;
      }

      return next.slice(next.length - MAX_ACTIVE_BLIPS);
    });
  }, [point]);

  useEffect(() => {
    if (blips.length === 0) {
      return;
    }

    let animationFrameId: number;

    const animate = (now: number) => {
      setFrameTime(now);
      setBlips((current) =>
        current.filter((blip) => now - blip.startedAt < BLIP_DURATION_MS),
      );

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [blips.length]);

  const sourceData = useMemo(() => {
    if (blips.length === 0) {
      return null;
    }

    const features = blips
      .map((blip) => {
        const elapsed = Math.max(0, frameTime - blip.startedAt);
        const progress = Math.min(1, elapsed / BLIP_DURATION_MS);

        if (progress >= 1) {
          return null;
        }

        return {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [blip.point.lng, blip.point.lat],
          },
          properties: {
            radius:
              BLIP_MIN_RADIUS + (BLIP_MAX_RADIUS - BLIP_MIN_RADIUS) * progress,
            opacity: BLIP_MAX_OPACITY * (1 - progress),
          },
        };
      })
      .filter((feature) => feature !== null);

    if (features.length === 0) {
      return null;
    }

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [blips, frameTime]);

  if (!sourceData) {
    return null;
  }

  return (
    <Source id="radius-blip-source" type="geojson" data={sourceData}>
      <Layer
        id="radius-blip-pulse"
        type="circle"
        paint={{
          "circle-radius": ["get", "radius"],
          "circle-color": "#93c5fd",
          "circle-opacity": ["get", "opacity"],
          "circle-stroke-color": "#dbeafe",
          "circle-stroke-width": 1.5,
          "circle-stroke-opacity": ["get", "opacity"],
        }}
      />
    </Source>
  );
}
