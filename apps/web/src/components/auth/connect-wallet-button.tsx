'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Icon } from '@/components/ui/icon';

export function ConnectWalletButton() {
  const router = useRouter();
  const { publicKey, connected, signMessage, disconnect } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const [loading, setLoading] = useState(false);
  const { user, setAuth, logout } = useAppStore((s) => ({ user: s.user, setAuth: s.setAuth, logout: s.logout }));

  const handleSignIn = async () => {
    if (!connected || !publicKey || !signMessage) return;
    setLoading(true);
    try {
      const walletAddress = publicKey.toBase58();
      const { data: challenge } = await api.post('/auth/connect', { walletAddress });
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(challenge.nonce);
      const signatureBytes = await signMessage(messageBytes);
      const signature = btoa(String.fromCharCode(...signatureBytes));
      const { data } = await api.post('/auth/verify', { walletAddress, signature, nonce: challenge.nonce });
      setAuth(data.accessToken, data.user);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    logout();
    disconnect();
  };

  if (connected && publicKey && user) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-slate-50 px-2 py-1 font-label-caps text-label-caps">
        <span className="rounded bg-purple-100 px-1 py-0.5 font-bold text-purple-700">{user.plan.toUpperCase()}</span>
        <span className="font-data-sm font-bold text-text-primary">{publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</span>
        <button onClick={handleDisconnect} className="text-text-muted hover:text-loss-crimson transition-colors">
          <Icon name="logout" className="text-body-md" />
        </button>
      </div>
    );
  }

  if (connected && publicKey) {
    return (
      <Button onClick={handleSignIn} disabled={loading} size="sm" className="font-label-caps text-label-caps font-bold">
        {loading ? 'Signing...' : 'Sign In'}
      </Button>
    );
  }

  return (
    <Button onClick={() => setVisible(!visible)} disabled={visible || loading} size="sm" className="font-label-caps text-label-caps font-bold">
      <Icon name="wallet" className="mr-1 text-body-md" />
      {loading ? 'Signing...' : 'Connect Wallet'}
    </Button>
  );
}
