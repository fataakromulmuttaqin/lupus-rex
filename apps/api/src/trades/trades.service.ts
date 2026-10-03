import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface TradeInput {
  botId: string;
  userId: string;
  type: 'arbitrage' | 'copy' | 'lp';
  pair: string;
  profit: number;
  volume: number;
}

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async record(data: TradeInput) {
    return this.prisma.trade.create({
      data: {
        id: randomUUID(),
        botId: data.botId,
        userId: data.userId,
        type: data.type,
        pair: data.pair,
        txSignature: this.fakeSignature(),
        profit: data.profit,
        volume: data.volume,
        gasUsed: BigInt(Math.floor(40000 + Math.random() * 80000)),
        rawData: JSON.stringify({}),
      },
    });
  }

  async findByBot(botId: string) {
    const trades = await this.prisma.trade.findMany({
      where: { botId },
      orderBy: { executedAt: 'desc' },
    });
    return trades.map((t) => this.serializeTrade(t));
  }

  async findByUser(userId: string) {
    const trades = await this.prisma.trade.findMany({
      where: { userId },
      orderBy: { executedAt: 'desc' },
    });
    return trades.map((t) => this.serializeTrade(t));
  }

  private serializeTrade(t: any) {
    return { ...t, profit: Number(t.profit), volume: Number(t.volume), gasUsed: Number(t.gasUsed) };
  }

  private fakeSignature() {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let out = '';
    for (let i = 0; i < 64; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
}
