'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface WsContextValue {
  socket: Socket | null;
  connected: boolean;
}

const WsContext = createContext<WsContextValue>({ socket: null, connected: false });

export function WsProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);

  const socket = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    return io(url, { transports: ['websocket', 'polling'] });
  }, []);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  return <WsContext.Provider value={{ socket, connected }}>{children}</WsContext.Provider>;
}

export function useWs() {
  return useContext(WsContext);
}
