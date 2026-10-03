import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ExecutionService } from '../execution/execution.service';

export type BotType = 'arbitrage' | 'copy' | 'lp';
export type BotStatus = 'running' | 'paused' | 'stopped' | 'error';

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
  private bots: Bot[] = [];

  constructor(private readonly execution: ExecutionService) {}

  create(userId: string, data: Partial<Bot>) {
    const now = new Date().toISOString();
    const bot: Bot = {
      id: randomUUID(),
      userId,
      name: data.name || 'Untitled Bot',
      type: data.type || 'arbitrage',
      status: 'stopped',
      config: data.config || {},
      capitalAllocated: data.capitalAllocated || 0,
      createdAt: now,
      updatedAt: now,
    };
    this.bots.push(bot);
    return bot;
  }

  findByUser(userId: string) {
    return this.bots.filter((b) => b.userId === userId);
  }

  findOne(id: string) {
    return this.bots.find((b) => b.id === id);
  }

  updateStatus(id: string, status: BotStatus) {
    const bot = this.bots.find((b) => b.id === id);
    if (!bot) return null;
    bot.status = status;
    bot.updatedAt = new Date().toISOString();

    if (status === 'running') {
      this.execution.start(bot);
    } else {
      this.execution.stop(bot.id);
    }

    return bot;
  }
}
