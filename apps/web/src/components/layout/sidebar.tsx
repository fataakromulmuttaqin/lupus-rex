'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Icon } from '@/components/ui/icon';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: React.ReactNode;
}

export function Sidebar() {
  const pathname = usePathname();
  const open = useAppStore((s) => s.sidebarOpen);
  const setOpen = useAppStore((s) => s.setSidebarOpen);
  const [running, setRunning] = useState(0);

  useEffect(() => {
    api.get('/bots')
      .then((r) => {
        const bots = r.data as { status: string }[];
        setRunning(bots.filter((b) => b.status === 'running').length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onResize = () => window.innerWidth >= 768 && setOpen(true);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [setOpen]);

  const nav: NavItem[] = [
    { href: '/', label: 'Overview', icon: 'grid_view', badge: <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-slate-100 text-text-muted border border-border-subtle">LIVE</span> },
    { href: '/arbitrage', label: 'Arbitrage Bots', icon: 'smart_toy', badge: <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-emerald-100/80 text-profit-emerald font-semibold border border-emerald-200">{running} Running</span> },
    { href: '/copy', label: 'Copy Trading', icon: 'group_work', badge: <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-purple-50 text-solana-purple border border-purple-200">78% Win</span> },
    { href: '/liquidity', label: 'Concentrated Liquidity', icon: 'water_drop', badge: <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-sky-100/70 text-primary border border-border-subtle">2 Active</span> },
    { href: '/arbitrage', label: 'Opportunity Scanner', icon: 'radar', badge: <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-bold border border-rose-200">HOT</span> },
    { href: '/analytics', label: 'Analytics & PnL', icon: 'query_stats' },
    { href: '/settings', label: 'Settings & RPC', icon: 'tune' },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border-subtle bg-surface-subtle shadow-sm transition-transform duration-200 md:translate-x-0 md:static',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border-subtle px-4">
          <div className="flex items-center gap-2">
            <Icon name="bolt" className="text-headline-sm text-primary" />
            <div className="flex flex-col leading-none">
              <span className="font-headline-sm font-bold text-text-primary">Aether</span>
              <span className="font-label-caps text-label-caps text-text-muted">QUANT HUB</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-profit-emerald animate-pulse"></span>
            <span className="font-label-caps text-label-caps text-profit-emerald font-bold">LIVE</span>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden">
            <Icon name="close" className="text-headline-sm" />
          </button>
        </div>

        <div className="flex h-[calc(100vh-64px)] flex-col">
          <div className="p-3">
            <div className="px-2 py-2 font-label-caps text-label-caps uppercase text-text-muted">Terminal Core</div>
            <nav className="flex flex-col gap-1">
              {nav.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => window.innerWidth < 768 && setOpen(false)}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-2 transition-all',
                      active
                        ? 'bg-primary/5 font-semibold text-primary shadow-[inset_3px_0_0_0_#0284c7]'
                        : 'text-text-secondary hover:bg-surface-variant hover:text-text-primary'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={item.icon} className="text-headline-sm" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {item.badge}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto space-y-3 border-t border-border-subtle bg-slate-50/50 p-4">
            <div className="rounded-lg border border-border-subtle bg-surface-subtle p-3 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-text-muted">PRIORITY FEE</span>
                <span className="font-label-caps text-label-caps text-profit-emerald font-semibold">OPTIMAL</span>
              </div>
              <div className="flex items-center justify-between font-data-md font-semibold text-text-primary">
                <span>15,400</span>
                <span className="font-label-caps font-normal text-text-muted">lamports/CU</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-slate-100">
                <div className="h-full w-2/5 bg-primary"></div>
              </div>
            </div>
            <div className="flex items-center justify-between px-1 font-label-caps text-label-caps text-text-secondary">
              <span className="flex items-center gap-1 hover:text-primary transition-colors">
                <Icon name="terminal" className="text-body-md" /> SDK v2.1.4
              </span>
              <span className="flex items-center gap-1 font-semibold text-profit-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-profit-emerald"></span> JITO RELAY
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
