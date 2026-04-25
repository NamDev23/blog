import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site';

export const runtime = 'edge';
export const alt = 'ShadowDev';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: '#0d120f',
          color: '#f4f1e8',
          fontFamily: 'Arial, sans-serif',
          backgroundImage:
            'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(245, 158, 11, 0.18) 45%, rgba(45, 212, 191, 0.18) 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontSize: 34,
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(244, 241, 232, 0.26)',
              background: 'rgba(244, 241, 232, 0.08)',
            }}
          >
            S
          </div>
          {siteConfig.name}
        </div>
        <div
          style={{
            maxWidth: 880,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ color: '#66d9c2', fontSize: 28, marginBottom: 20 }}>
            Engineering journal
          </div>
          <div style={{ fontSize: 82, lineHeight: 1.02, fontWeight: 900 }}>
            Interface craft, secure systems, and faster web experiences.
          </div>
        </div>
        <div style={{ color: '#d6c7a1', fontSize: 26 }}>{siteConfig.url}</div>
      </div>
    ),
    size
  );
}
