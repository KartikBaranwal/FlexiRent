"use client";
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChatWidget } from '@/components/ChatWidget';
import { AuthModal } from '@/components/AuthModal';

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    // Admin pages: no navbar, footer, or chat widget
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <AuthModal />
      <main className="min-h-[calc(100vh-theme('spacing.20'))] pt-20">
        {children}
      </main>
      <ChatWidget />
      <Footer />
    </>
  );
}
