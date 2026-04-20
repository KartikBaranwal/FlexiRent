import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { SiteShell } from '@/components/SiteShell';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlexiRent | Premium Furniture & Appliance Rentals',
  description: 'Upgrade your living space with flexible, high-quality furniture and appliance rentals. No hidden costs, free relocation, and premium service.',
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
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AppProvider>
            <Toaster 
              position="bottom-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#0f172a',
                  color: '#fff',
                  borderRadius: '1rem',
                  fontSize: '14px',
                  fontWeight: '500',
                },
              }}
            />
            <SiteShell>
              {children}
            </SiteShell>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
