import { Injectable, Logger } from '@nestjs/common';
import { TradesService } from '../trades/trades.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { Bot } from '../bots/bots.service';

const PAIRS = ['SOL/USDC', 'BONK/SOL', 'JUP/USDC', 'WIF/SOL', 'PYTH/USDC'];

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);
  private timers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly trades: TradesService,
    private readonly realtime: RealtimeGateway,
  ) {}

  start(bot: Bot) {
    if (this.timers.has(bot.id)) return;
    this.logger.log(`Starting execution loop for bot ${bot.name} (${bot.id})`);

    const tick = () => {
      const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
      const volume = Number((0.1 + Math.random() * 2).toFixed(4));
      const profit = Number((Math.random() * 0.05 - 0.005).toFixed(6));

      const trade = this.trades.record({
        botId: bot.id,
        userId: bot.userId,
        type: bot.type,
        pair,
        profit,
        volume,
      });

      this.realtime.emitTradeExecuted({
        botId: bot.id,
        userId: bot.userId,
        pair: trade.pair,
        profit: trade.profit,
        volume: trade.volume,
        txSignature: trade.txSignature,
        timestamp: trade.executedAt,
      });
    };

    const interval = Math.max(2000, Number(bot.config?.tickIntervalMs) || 5000);
    this.timers.set(bot.id, setInterval(tick, interval));
  }

  stop(botId: string) {
    const timer = this.timers.get(botId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(botId);
      this.logger.log(`Stopped execution loop for bot ${botId}`);
    }
  }

  isRunning(botId: string) {
    return this.timers.has(botId);
  }
}
