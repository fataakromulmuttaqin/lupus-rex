'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface WalletContextValue {
  connected: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const connect = async () => {
    const mockKey = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
    setPublicKey(mockKey);
    setConnected(true);
  };

  const disconnect = () => {
    setPublicKey(null);
    setConnected(false);
  };

  const signMessage = async (message: Uint8Array) => {
    // Simulated signature (base64 of the message for demo)
    return new Uint8Array(message);
  };

  return (
    <WalletContext.Provider value={{ connected, publicKey, connect, disconnect, signMessage }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
