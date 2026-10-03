import { Icon } from '@/components/ui/icon';

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface-subtle p-8 text-center shadow-sm">
      <Icon name="query_stats" className="text-5xl text-profit-emerald" />
      <h1 className="mt-4 font-headline-md text-headline-md font-bold text-text-primary">Analytics</h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">Coming soon. PnL attribution, equity curve, trade journal, and export.</p>
    </div>
  );
}
