import { Icon } from '@/components/ui/icon';

export default function CopyPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface-subtle p-8 text-center shadow-sm">
      <Icon name="group_work" className="text-5xl text-solana-purple" />
      <h1 className="mt-4 font-headline-md text-headline-md font-bold text-text-primary">Copy Trading</h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">Coming soon. Wallet leaderboard, one-click follow, and copy session monitoring.</p>
    </div>
  );
}
