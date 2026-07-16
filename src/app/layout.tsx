import type { Metadata } from 'next';
import { Chakra_Petch, Mulish } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const chakraPetch = Chakra_Petch({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-chakra-petch',
  display: 'swap',
});

const mulish = Mulish({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mulish',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GearSync - Premium Auto Maintenance & Repair Services',
  description: 'Reliable car repair, engine tuning, brake servicing, battery diagnostic, and tire replacements by expert mechanics. Book your auto service online today!',
  keywords: 'car service, auto repair, mechanic, engine repair, brake repair, tire replacement, battery service, book mechanic',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'GearSync - Premium Auto Maintenance & Repair Services',
    description: 'Expert diagnostics and repairs by certified mechanics to keep your vehicle running smoothly.',
    type: 'website',
    images: [
      {
        url: '/assets/images/hero-banner.png',
        width: 1200,
        height: 630,
        alt: 'GearSync Car Repair Services',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${chakraPetch.variable} ${mulish.variable}`} style={{ scrollBehavior: 'smooth' }}>
      <head>
        {/* Material Symbols Rounded font link */}
        <link 
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@40,600,0,0" 
        />
      </head>
      <body style={{ backgroundColor: 'var(--white)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
