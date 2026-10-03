export interface Bot {
  id: string;
  userId: string;
  name: string;
  type: 'arbitrage' | 'copy' | 'lp';
  status: 'running' | 'paused' | 'stopped' | 'error';
  config: Record<string, unknown>;
  capitalAllocated: number;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  pair: string;
  route: string[];
  estimatedProfit: number;
  dexes: string[];
  timestamp: string;
}

export interface Trade {
  id: string;
  botId: string;
  userId: string;
  type: 'arbitrage' | 'copy' | 'lp';
  pair: string;
  txSignature: string;
  profit: number;
  volume: number;
  gasUsed: number;
  executedAt: string;
}

export interface TradeExecutedEvent {
  botId: string;
  userId: string;
  pair: string;
  profit: number;
  volume: number;
  txSignature: string;
  timestamp: string;
}
