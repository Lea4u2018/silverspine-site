// components/StarRating.jsx
import React from "react";

/** A single star with partial (0..1) fill using two stacked glyphs */
function Star({ fill = 1, size = 28 }) {
  const safe = Math.max(0, Math.min(1, fill));
  return (
    <span
      className="relative inline-block align-middle"
      style={{ fontSize: size, lineHeight: 1, width: size, height: size }}
      aria-hidden="true"
    >
      <span className="text-gray-600 select-none">★</span>
      <span
        className="absolute top-0 left-0 overflow-hidden pointer-events-none"
        style={{ width: `${safe * 100}%` }}
      >
        <span className="text-yellow-400 select-none">★</span>
      </span>
    </span>
  );
}

/** Read-only row of 5 stars for a value like 4.5 */
export function StarDisplay({ value, size = 22 }) {
  const fills = [1, 2, 3, 4, 5].map((i) => {
    const diff = value - (i - 1);
    return Math.max(0, Math.min(1, diff));
  });
  return (
    <span className="inline-flex items-center gap-1">
      {fills.map((f, idx) => (
        <Star key={idx} fill={f} size={size} />
      ))}
      <span className="ml-2 text-sm text-gray-300">
        {value?.toFixed?.(1)}
      </span>
    </span>
  );
}

/** Interactive ½-step rating: click left/right half, arrows adjust by 0.5 */
export default function StarRating({
  value,
  onChange,
  size = 28,
  id = "rating",
  readOnly = false,
}) {
  const setFromClick = (e, index) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = x < rect.width / 2 ? 0.5 : 1.0;
    const newVal = Math.max(0.5, Math.min(5, index + half));
    onChange(newVal);
  };

  const onKeyDown = (e) => {
    if (readOnly || !onChange) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(5, Math.round((value + 0.5) * 2) / 2));
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(0.5, Math.round((value - 0.5) * 2) / 2));
    }
  };

  const fills = [0, 1, 2, 3, 4].map((i) => {
    const diff = value - i;
    return Math.max(0, Math.min(1, diff));
  });

  return (
    <div
      role="slider"
      aria-labelledby={`${id}-label`}
      aria-valuemin={0.5}
      aria-valuemax={5}
      aria-valuenow={value}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="inline-flex items-center gap-1"
    >
      <span id={`${id}-label`} className="sr-only">
        Rating
      </span>
      {fills.map((f, i) => (
        <button
          key={i}
          type="button"
          disabled={readOnly}
          onClick={(e) => setFromClick(e, i)}
          className="p-0 m-0 bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-sm"
          aria-label={`Set rating around ${i + 1} star`}
          title={`${(i + 1).toFixed(0)} star area`}
        >
          <Star fill={f} size={size} />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-300">{value.toFixed(1)}</span>
    </div>
  );
}
