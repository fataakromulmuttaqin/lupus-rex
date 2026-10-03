import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface TradeExecutedEvent {
  botId: string;
  userId: string;
  pair: string;
  profit: number;
  volume: number;
  txSignature: string;
  timestamp: string;
}

export interface BotStatusEvent {
  botId: string;
  status: 'running' | 'paused' | 'stopped' | 'error';
  timestamp: string;
}

@WebSocketGateway({ cors: { origin: 'http://localhost:3000' } })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('WS client connected', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('WS client disconnected', client.id);
  }

  emitTradeExecuted(event: TradeExecutedEvent) {
    this.server?.emit('trade.executed', event);
  }

  emitBotStatus(event: BotStatusEvent) {
    this.server?.emit('bot.status.update', event);
  }

  emitOpportunity(event: Record<string, unknown>) {
    this.server?.emit('opportunity.new', event);
  }
}
