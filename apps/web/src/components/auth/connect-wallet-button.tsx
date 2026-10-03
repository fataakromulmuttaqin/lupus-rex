'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

export function ConnectWalletButton({ size = 'default' }: { size?: 'default' | 'lg' }) {
  const router = useRouter();
  const { publicKey, connected, signMessage, disconnect } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const [loading, setLoading] = useState(false);
  const setAuth = useAppStore((s) => s.setAuth);

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

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground md:inline">
          {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}
        </span>
        <Button onClick={handleSignIn} disabled={loading} size={size}>
          {loading ? 'Signing...' : 'Sign In'}
        </Button>
        <Button variant="outline" onClick={disconnect} size={size}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button size={size} onClick={() => setVisible(!visible)} disabled={visible || loading}>
      <Wallet className="mr-2 h-4 w-4" />
      {loading ? 'Signing...' : 'Connect Wallet'}
    </Button>
  );
}
