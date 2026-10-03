'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-surface-base">
      <Sidebar />
      <div className="pl-64">
        <Navbar />
        <main className="min-h-screen w-full p-4 pt-16 md:p-6 md:pt-20">{children}</main>
      </div>
    </div>
  );
}
