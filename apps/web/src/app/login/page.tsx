import { ConnectWalletButton } from '@/components/auth/connect-wallet-button';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-base p-6 text-text-primary">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border-subtle bg-surface-subtle p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">Lupus Rex</h1>
        <p className="text-text-secondary">Solana MEV & Liquidity Hub</p>
        <ConnectWalletButton />
        <p className="text-xs text-text-muted">
          By connecting, you agree to the Risk Disclosure and Terms of Service.
        </p>
      </div>
    </div>
  );
}
