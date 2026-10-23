import { ImageResponse } from 'next/og';
export const dynamic = 'force-static';
export const alt = 'VAT Check GH. Your digital VAT, explained.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#eff3e8',
        color: '#174c3c',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '70px',
        borderTop: '14px solid #eec96b',
      }}
    >
      <div style={{ fontSize: 31, display: 'flex' }}>VAT Check GH</div>
      <div
        style={{ fontSize: 75, lineHeight: 1.1, letterSpacing: -3, display: 'flex', marginTop: 65 }}
      >
        Your digital VAT,
        <br />
        explained.
      </div>
      <div style={{ fontSize: 25, marginTop: 40, display: 'flex' }}>
        Official sources. Plain language. Built for Ghana.
      </div>
      <div style={{ fontSize: 19, marginTop: 40, display: 'flex' }}>
        Independent guidance · Not affiliated with GRA
      </div>
    </div>,
    size,
  );
}
