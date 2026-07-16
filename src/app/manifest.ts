import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GearSync Auto Maintenance & Repair Service',
    short_name: 'GearSync',
    description: 'Schedule premium auto services, track car repair status, and review verified mechanic reviews in real-time.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f19',
    theme_color: '#c51800',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
