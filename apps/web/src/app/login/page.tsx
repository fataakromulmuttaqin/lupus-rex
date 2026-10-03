import { ConnectWalletButton } from '@/components/auth/connect-wallet-button';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-50">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Lupus Rex</h1>
        <p className="text-zinc-400">Solana MEV & Liquidity Hub</p>
        <ConnectWalletButton size="lg" />
        <p className="text-xs text-zinc-500">
          By connecting, you agree to the Risk Disclosure and Terms of Service.
        </p>
      </div>
    </div>
  );
}
