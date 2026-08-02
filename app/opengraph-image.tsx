import { ImageResponse } from 'next/og';
import { brand, site } from '@/lib/content';

/**
 * The mark, inlined as a data URI. Satori renders `<img>` with SVG data URIs
 * reliably; it cannot draw a notched annulus out of divs. Geometry is identical
 * to components/ui/LogoMark.tsx, recoloured for the ink background.
 */
const MARK_DATA_URI =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">` +
      `<path d="M52.4 0.058A50 50 0 1 0 99.806 45.6L79.473 45.6A29.8 29.8 0 1 1 52.4 20.297Z" fill="#FAFAF8"/>` +
      `<rect x="66.4" y="1.4" width="29.8" height="29.8" fill="#3E846B"/>` +
      `</svg>`,
  );

export const alt = site.meta.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Generated at build time into a static PNG — no runtime cost, nothing to keep
 * in sync by hand, and the copy comes from info.json like everything else.
 *
 * NOTE: renders in ImageResponse's default face, not the site's display font.
 * It should be regenerated with the real wordmark once the locked logo assets
 * land in public/assets/logo/ (see README → Known placeholders).
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0B0E11',
          color: '#FAFAF8',
          padding: '72px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MARK_DATA_URI} width={56} height={56} alt="" />
          <div style={{ fontSize: 46, letterSpacing: '-0.045em' }}>
            {brand.name.toLowerCase()}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 68,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            maxWidth: 960,
          }}
        >
          {brand.tagline}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 26,
            color: '#8F959C',
            letterSpacing: '-0.01em',
          }}
        >
          {brand.domain}
        </div>
      </div>
    ),
    size,
  );
}
