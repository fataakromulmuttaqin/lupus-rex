import { Controller, Get, Post, Body } from '@nestjs/common';
import { ArbitrageService } from './arbitrage.service';

@Controller('arbitrage')
export class ArbitrageController {
  constructor(private readonly arbitrage: ArbitrageService) {}

  @Get('opportunities')
  findAll() {
    return this.arbitrage.findAll();
  }

  @Post('simulate')
  simulate(@Body() dto: any) {
    return { ok: true, estimatedProfit: 0.014, gas: 0.0001, netProfit: 0.0139, input: dto };
  }
}
