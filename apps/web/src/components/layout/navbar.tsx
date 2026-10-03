'use client';

import { Bell, Menu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { ConnectWalletButton } from '@/components/auth/connect-wallet-button';

export function Navbar() {
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/10 bg-card/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-cyan-400" />
          <span className="text-lg font-bold tracking-tight">Lupus Rex</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <ConnectWalletButton />
      </div>
    </header>
  );
}
