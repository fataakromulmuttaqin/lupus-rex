'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/components/providers/wallet-provider';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

export function ConnectWalletButton({ size = 'default' }: { size?: 'default' | 'lg' }) {
  const router = useRouter();
  const { connected, publicKey, connect, disconnect } = useWallet();
  const [loading, setLoading] = useState(false);
  const setAuth = useAppStore((s) => s.setAuth);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await connect();
      const wallet = publicKey || '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
      const { data: challenge } = await api.post('/auth/connect', { walletAddress: wallet });
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(challenge.nonce);
      const signatureBytes = await Promise.resolve(messageBytes);
      const signature = btoa(String.fromCharCode(...signatureBytes));
      const { data } = await api.post('/auth/verify', {
        walletAddress: wallet,
        signature,
        nonce: challenge.nonce,
      });
      setAuth(data.accessToken, data.user);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (connected) {
    return (
      <Button variant="outline" onClick={disconnect}>
        Disconnect
      </Button>
    );
  }

  return (
    <Button size={size} onClick={handleConnect} disabled={loading}>
      <Wallet className="mr-2 h-4 w-4" />
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
