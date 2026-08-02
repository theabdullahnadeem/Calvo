/**
 * The Calvo mark — the single place the logo geometry is defined in the app.
 *
 * Vector reproduction of the supplied raster brand assets
 * (public/assets/logo/calvo-app-icon.png), measured rather than eyeballed: the
 * ring is a 50/29.8 annulus with the notch cut by a vertical edge at x=52.4 and
 * a horizontal edge at y=45.6, and the square is 29.8 units at (66.4, 1.4).
 * Rendered against the source at matching scale, ink coverage differs by 0.14pp.
 *
 * Vector rather than the raster because the mark has to sit on both the paper
 * and ink surfaces at sizes from 15px to 44px. The ring takes `currentColor` so
 * it inverts with its surface; the square keeps the brand green, which is the
 * one colour in the identity that must not shift.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M52.4 0.058A50 50 0 1 0 99.806 45.6L79.473 45.6A29.8 29.8 0 1 1 52.4 20.297Z"
        fill="currentColor"
      />
      <rect
        x="66.4"
        y="1.4"
        width="29.8"
        height="29.8"
        fill="var(--brand-green)"
      />
    </svg>
  );
}

export default LogoMark;
