import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../utils/cn.js";

const SCENE_HEIGHT = 420;
const FLOOR_HEIGHT = 36;
const PX_PER_METER = 26;
const VELOCITY_STOP_THRESHOLD = 18;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildInitialObjects(objects = [], height = 8, bounce = 0.68) {
  const dropMeters = clamp(Number(height) || 8, 1, 12);
  const dropPixels = dropMeters * PX_PER_METER;
  const floorY = SCENE_HEIGHT - FLOOR_HEIGHT;

  return objects.map((object, index) => {
    const size = clamp(Number(object.size) || 44, 24, 72);
    const lane = object.x ?? 18 + index * 30;
    const normalizedBounce =
      object.bounceMultiplier != null
        ? clamp(Number(object.bounceMultiplier) * bounce, 0.15, 0.92)
        : clamp(Number(object.bounce) || bounce, 0.15, 0.92);

    return {
      id: object.id || object.label || `object-${index}`,
      label: object.label || `Object ${index + 1}`,
      className: object.className || "bg-sky-400",
      textClassName: object.textClassName || "text-white",
      shape: object.shape === "square" ? "square" : "circle",
      size,
      x: clamp(Number(lane), 8, 88),
      bounce: normalizedBounce,
      y: Math.max(16, floorY - size - dropPixels),
      vy: 0,
      settled: false,
    };
  });
}

export default function DropSimulation({
  gravity = 9.8,
  height = 8,
  bounce = 0.68,
  play = false,
  resetKey,
  objects = [],
  className,
}) {
  const objectsKey = useMemo(() => JSON.stringify(objects), [objects]);
  const [items, setItems] = useState(() => buildInitialObjects(objects, height, bounce));
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const nextItems = buildInitialObjects(objects, height, bounce);
    itemsRef.current = nextItems;
    setItems(nextItems);
  }, [bounce, height, objectsKey, resetKey, objects]);

  useEffect(() => {
    if (!play) {
      return undefined;
    }

    let frameId = 0;
    let lastTime = performance.now();
    const gravityPx = clamp(Number(gravity) || 9.8, 0.5, 30) * 28;

    const tick = (now) => {
      const delta = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;
      const floorY = SCENE_HEIGHT - FLOOR_HEIGHT;
      let stillMoving = false;

      const nextItems = itemsRef.current.map((item) => {
        if (item.settled) {
          return item;
        }

        let vy = item.vy + gravityPx * delta;
        let y = item.y + vy * delta;
        const stopY = floorY - item.size;

        if (y >= stopY) {
          y = stopY;

          if (Math.abs(vy) < VELOCITY_STOP_THRESHOLD) {
            vy = 0;
            return {
              ...item,
              y,
              vy,
              settled: true,
            };
          }

          vy = -vy * item.bounce;
        }

        stillMoving = true;

        return {
          ...item,
          y,
          vy,
        };
      });

      itemsRef.current = nextItems;
      setItems(nextItems);

      if (stillMoving) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [play, gravity]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.95)_0%,rgba(2,6,23,0.98)_100%)]",
        className
      )}
      style={{ height: `${SCENE_HEIGHT}px` }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-400/10 to-transparent" />
      <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
        Drop height: {height} m
      </div>
      <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
        Gravity: {gravity} m/s^2
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="absolute flex flex-col items-center gap-2"
          style={{
            left: `${item.x}%`,
            top: `${item.y}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className={cn("text-xs font-medium text-slate-300", item.textClassName)}>{item.label}</div>
          <div
            className={cn(
              "shadow-[0_10px_30px_rgba(15,23,42,0.35)]",
              item.shape === "square" ? "rounded-xl" : "rounded-full",
              item.className
            )}
            style={{
              width: `${item.size}px`,
              height: `${item.size}px`,
            }}
          />
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-9 border-t border-white/10 bg-gradient-to-r from-emerald-500/30 via-emerald-400/20 to-cyan-400/30" />
      <div className="absolute inset-x-0 bottom-9 border-t border-dashed border-white/10" />
    </div>
  );
}
