import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ExecutionService } from '../execution/execution.service';

export type BotType = 'arbitrage' | 'copy' | 'lp';
export type BotStatus = 'running' | 'paused' | 'stopped' | 'error';

export interface BotConfig {
  minProfitLamports?: number;
  dexes?: string[];
  tickIntervalMs?: number;
  [key: string]: any;
}

export interface Bot {
  id: string;
  userId: string;
  name: string;
  type: BotType;
  status: BotStatus;
  config: Record<string, any>;
  capitalAllocated: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class BotsService {
  constructor(private readonly prisma: PrismaService, private readonly execution: ExecutionService) {}

  async create(userId: string, data: Partial<Bot>) {
    const config = typeof data.config === 'object' && data.config !== null ? data.config : {};
    return this.prisma.bot.create({
      data: {
        id: randomUUID(),
        userId,
        name: data.name || 'Untitled Bot',
        type: data.type || 'arbitrage',
        status: 'stopped',
        config: JSON.stringify(config),
        capitalAllocated: data.capitalAllocated || 0,
      },
    });
  }

  async findByUser(userId: string) {
    const bots = await this.prisma.bot.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return bots.map((b) => this.serializeBot(b));
  }

  async findOne(id: string) {
    const bot = await this.prisma.bot.findUnique({ where: { id } });
    return bot ? this.serializeBot(bot) : null;
  }

  async updateStatus(id: string, status: BotStatus) {
    const bot = await this.prisma.bot.update({
      where: { id },
      data: { status },
    });

    if (status === 'running') {
      this.execution.start(bot);
    } else {
      this.execution.stop(bot.id);
    }

    return this.serializeBot(bot);
  }

  private serializeBot(bot: any) {
    return { ...bot, capitalAllocated: Number(bot.capitalAllocated), config: this.safeJson(bot.config, {}) };
  }

  private safeJson(value: string | null | undefined, fallback: any) {
    if (!value) return fallback;
    try { return JSON.parse(value); } catch { return fallback; }
  }
}
