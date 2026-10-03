import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

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

@Injectable()
export class TradesService {
  private trades: Trade[] = [];

  record(data: Omit<Trade, 'id' | 'executedAt' | 'txSignature' | 'gasUsed'> & Partial<Trade>): Trade {
    const trade: Trade = {
      id: randomUUID(),
      txSignature: data.txSignature || this.fakeSignature(),
      gasUsed: data.gasUsed ?? Math.floor(40000 + Math.random() * 80000),
      executedAt: new Date().toISOString(),
      ...data,
    } as Trade;
    this.trades.push(trade);
    return trade;
  }

  findByBot(botId: string) {
    return this.trades.filter((t) => t.botId === botId);
  }

  findByUser(userId: string) {
    return this.trades.filter((t) => t.userId === userId);
  }

  private fakeSignature() {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let out = '';
    for (let i = 0; i < 64; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
}
