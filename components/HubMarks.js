/** Thin gold line marks for the home hub — not generic icon-font glyphs. */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function MarkFrame({ children, label }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width="56"
      height="56"
      aria-hidden="true"
      className="hub-mark"
    >
      <title>{label}</title>
      {children}
    </svg>
  );
}

export function BookMark() {
  return (
    <MarkFrame label="Books">
      <path {...stroke} d="M12 50V16.5c0-1.2.9-2.2 2.1-2.4L32 12l17.9 2.1c1.2.2 2.1 1.2 2.1 2.4V50" />
      <path {...stroke} d="M32 12v38" />
      <path {...stroke} d="M12 50c4.5-3 10-4.5 20-4.5S47.5 47 52 50" />
      <path {...stroke} d="M20 24h8M20 32h8M36 24h8M36 32h8" />
    </MarkFrame>
  );
}

export function QuillMark() {
  return (
    <MarkFrame label="Blog">
      {/* Writing pen at a natural angle */}
      <path {...stroke} d="M46 10l6 6-24 28-8-6 26-28z" />
      <path {...stroke} d="M42 14l6 6" />
      <path {...stroke} d="M28 38l-8-6" />
      <path {...stroke} d="M20 44l-6 10 10-6" />
      <path {...stroke} d="M16 50.5L12 58" />
      <path {...stroke} d="M10 58h16" />
    </MarkFrame>
  );
}

export function NeighborsMark() {
  return (
    <MarkFrame label="Neighbors">
      <circle {...stroke} cx="32" cy="20" r="6" />
      <circle {...stroke} cx="16" cy="24" r="5" />
      <circle {...stroke} cx="48" cy="24" r="5" />
      <path {...stroke} d="M20 48c.5-8 5.5-12 12-12s11.5 4 12 12" />
      <path {...stroke} d="M8 50c.4-6.5 4.2-10 8.8-10 2.6 0 4.8 1 6.4 2.8" />
      <path {...stroke} d="M56 50c-.4-6.5-4.2-10-8.8-10-2.6 0-4.8 1-6.4 2.8" />
    </MarkFrame>
  );
}

export function ShopMark() {
  return (
    <MarkFrame label="Shop">
      <path {...stroke} d="M16 22h32l-3 26H19L16 22z" />
      <path {...stroke} d="M24 22V18a8 8 0 0 1 16 0v4" />
      <path {...stroke} d="M22 34h20" />
    </MarkFrame>
  );
}
