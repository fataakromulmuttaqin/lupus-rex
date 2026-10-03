import { Icon } from '@/components/ui/icon';

export default function LiquidityPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface-subtle p-8 text-center shadow-sm">
      <Icon name="water_drop" className="text-5xl text-primary" />
      <h1 className="mt-4 font-headline-md text-headline-md font-bold text-text-primary">Liquidity Management</h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">Coming soon. Create and manage concentrated liquidity positions on Orca, Meteora, and Raydium.</p>
    </div>
  );
}
