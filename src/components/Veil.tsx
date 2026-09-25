import { type CSSProperties } from "react";

const LAYERS = 8;

function layerStyle(index: number, edge: "top" | "bottom"): CSSProperties {
  const segment = 1 / (LAYERS + 1);
  const stops = [0, 1, 2, 3].map((step, pos) => {
    const alpha = pos === 1 || pos === 2 ? 1 : 0;
    return `rgba(255,255,255,${alpha}) ${(index + step) * segment * 100}%`;
  });
  const mask = `linear-gradient(${edge === "bottom" ? 180 : 0}deg, ${stops.join(", ")})`;
  const blur = `blur(${index * 2.5}px)`;
  return { maskImage: mask, WebkitMaskImage: mask, backdropFilter: blur, WebkitBackdropFilter: blur };
}

export function Veil({ edge }: { edge: "top" | "bottom" }) {
  return (
    <div aria-hidden className={`veil veil--${edge}`}>
      {Array.from({ length: LAYERS }, (_, index) => <span key={index} style={layerStyle(index, edge)} />)}
    </div>
  );
}
