'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { ConnectWalletButton } from '@/components/auth/connect-wallet-button';
import { Icon } from '@/components/ui/icon';
import { api } from '@/lib/api';

export function Navbar() {
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const [notifCount] = useState(3);

  const pauseAll = async () => {
    try {
      const { data: bots } = await api.get('/bots');
      const running = (bots as { id: string; status: string }[]).filter((b) => b.status === 'running');
      await Promise.all(running.map((b) => api.post(`/bots/${b.id}/stop`)));
      window.location.reload();
    } catch {
      // ignore
    }
  };

  return (
    <header className="fixed top-0 left-64 right-0 z-40 flex h-16 items-center justify-between border-b border-border-subtle bg-white/90 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="md:hidden">
          <Icon name="menu" className="text-headline-sm" />
        </Button>
        <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1">
          <span className="font-label-caps text-label-caps font-bold text-sky-700">MAINNET-BETA</span>
        </div>
        <div className="hidden items-center gap-3 font-label-caps text-label-caps text-text-muted xl:flex">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-profit-emerald"></span>
            <span>TPS: <strong className="text-text-primary">2,842</strong></span>
          </div>
          <span className="text-border-subtle">/</span>
          <span>PING: <strong className="text-profit-emerald">42ms</strong></span>
          <span className="text-border-subtle">/</span>
          <span>BLOCK: <strong className="text-text-primary">#298,412,019</strong></span>
        </div>
      </div>

      <div className="mx-4 flex-1 max-w-md">
        <div className="relative flex items-center">
          <Icon name="search" className="absolute left-3 text-body-md text-text-muted" />
          <input
            className="w-full rounded-lg border border-border-subtle bg-slate-50 py-1.5 pl-9 pr-14 text-sm text-text-primary shadow-inner placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search routes, tokens, pools, bot IDs..."
            type="text"
          />
          <span className="absolute right-2.5 rounded border border-border-subtle bg-white px-1.5 py-0.5 font-label-caps text-label-caps text-text-muted shadow-xs">⌘K</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1.5 rounded-lg border border-border-subtle bg-slate-50 px-2.5 py-1 lg:flex">
          <span className="font-label-caps text-label-caps text-text-muted">SOL</span>
          <span className="font-data-sm font-bold text-text-primary">$154.20</span>
          <span className="font-data-sm font-semibold text-profit-emerald">+3.4%</span>
        </div>

        <Button
          variant="outline"
          onClick={pauseAll}
          className="flex items-center gap-1.5 border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
        >
          <Icon name="pause_circle" className="text-body-md" />
          <span className="hidden font-label-caps text-label-caps font-bold uppercase sm:inline">Emergency Pause All</span>
        </Button>

        <div className="relative">
          <Button variant="ghost" size="icon" className="rounded-lg border border-border-subtle bg-slate-50 hover:bg-slate-100">
            <Icon name="notifications" className="text-headline-sm" />
          </Button>
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-loss-crimson font-label-caps text-[10px] font-bold text-white">{notifCount}</span>
          )}
        </div>

        <div className="hidden items-center gap-1 rounded-lg border border-border-subtle bg-slate-50 px-2 py-1 font-label-caps text-label-caps text-text-secondary sm:flex">
          <Icon name="bolt" className="text-body-md text-profit-emerald" />
          <span className="font-medium">Triton Jito</span>
        </div>

        <ConnectWalletButton />

        <Image
          alt="Profile"
          className="rounded-full object-cover ring-2 ring-slate-200"
          src="https://api.dicebear.com/7.x/initials/svg?seed=LupusRex"
          width={32}
          height={32}
          unoptimized
        />
      </div>
    </header>
  );
}
