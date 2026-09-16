/** Highway photograph from The Beautiful Beast cover — no title stacked on the sky. */
export const PAGE_COVER_BG = "/covers/hero-user-highway.jpg";

export default function PageBackdrop({ overlayClassName = "bg-black/62" }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <img
        src={PAGE_COVER_BG}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_28%] select-none"
        draggable="false"
      />
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  );
}
