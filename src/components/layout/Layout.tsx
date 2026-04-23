import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Layered background effects */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none opacity-80" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_hsl(var(--primary)/0.08),transparent)] pointer-events-none" />
      
      {/* Noise texture */}
      <div className="noise" />
      
      {/* Content */}
      <div className="relative">
        <Navbar />
        <main className="relative animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
