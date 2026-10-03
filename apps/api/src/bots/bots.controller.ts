import { Body, Controller, Get, Param, Post, Headers } from '@nestjs/common';
import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { BotsService } from './bots.service';
import { AuthService } from '../auth/auth.service';
import { TradesService } from '../trades/trades.service';

class CreateBotDto {
  @IsString() name: string;
  @IsString() type: 'arbitrage' | 'copy' | 'lp';
  @IsObject() config: Record<string, any>;
  @IsOptional() @IsNumber() capitalAllocated?: number;
}

@Controller('bots')
export class BotsController {
  constructor(
    private readonly bots: BotsService,
    private readonly auth: AuthService,
    private readonly trades: TradesService,
  ) {}

  private currentUser(authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.auth.me(token);
  }

  @Get()
  async findAll(@Headers('authorization') auth: string) {
    const user = this.currentUser(auth);
    return this.bots.findByUser(user.id);
  }

  @Post()
  async create(@Headers('authorization') auth: string, @Body() dto: CreateBotDto) {
    const user = this.currentUser(auth);
    return this.bots.create(user.id, dto);
  }

  @Post(':id/start')
  async start(@Param('id') id: string) {
    return this.bots.updateStatus(id, 'running');
  }

  @Post(':id/stop')
  async stop(@Param('id') id: string) {
    return this.bots.updateStatus(id, 'stopped');
  }

  @Post(':id/emergency-stop')
  async emergencyStop(@Param('id') id: string) {
    return this.bots.updateStatus(id, 'stopped');
  }

  @Get(':id/trades')
  async getTrades(@Param('id') id: string) {
    return this.trades.findByBot(id);
  }
}
