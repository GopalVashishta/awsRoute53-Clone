'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { FlashBar } from '@/components/ui/FlashBar';

interface Props { children: React.ReactNode; }

export function AppShell({ children }: Props) {
  const router = useRouter();
  const lastKeyRef = useRef<{ key: string; time: number }>({ key: '', time: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Skip shortcuts if typing in input, textarea, or contenteditable
      if(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)){
        return;
      }

      const now = Date.now();
      const last = lastKeyRef.current;

      // 'g' then 'h' -> Navigate to /hosted-zones
      if(last.key === 'g' && e.key.toLowerCase() === 'h' && now - last.time < 1000){
        e.preventDefault();
        router.push('/hosted-zones');
        lastKeyRef.current = { key: '', time: 0 };
        return;
      }

      lastKeyRef.current = { key: e.key.toLowerCase(), time: now };

      // 'c' -> Navigate to /hosted-zones/create
      if(e.key.toLowerCase() === 'c'){
        e.preventDefault();
        router.push('/hosted-zones/create');
      }

      // 'd' -> Toggle dark mode
      else if(e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1, marginTop: 56 }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 240, backgroundColor: 'var(--color-bg)', minHeight: 'calc(100vh - 56px)', overflowY: 'auto' }}>
          <FlashBar />
          {children}
        </main>
      </div>
    </div>
  );
}
