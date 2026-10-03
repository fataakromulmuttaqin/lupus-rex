'use client';

import { ReactNode } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import '@solana/wallet-adapter-react-ui/styles.css';

export function WalletProvider({ children }: { children: ReactNode }) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
