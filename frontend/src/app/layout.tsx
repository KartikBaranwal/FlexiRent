import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { SiteShell } from '@/components/SiteShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlexiRent',
  description: 'Modern rental platform for your home',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <AppProvider>
          <SiteShell>
            {children}
          </SiteShell>
        </AppProvider>
      </body>
    </html>
  );
}
