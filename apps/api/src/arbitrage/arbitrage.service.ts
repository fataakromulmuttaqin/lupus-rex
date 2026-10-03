import { Injectable } from '@nestjs/common';

export interface Opportunity {
  id: string;
  pair: string;
  route: string[];
  estimatedProfit: number;
  dexes: string[];
  timestamp: string;
}

@Injectable()
export class ArbitrageService {
  private opportunities: Opportunity[] = [];

  constructor() {
    this.seed();
  }

  findAll(): Opportunity[] {
    return this.opportunities;
  }

  seed() {
    const now = new Date().toISOString();
    this.opportunities = [
      { id: 'opp-1', pair: 'SOL/USDC', route: ['SOL->USDC->SOL'], estimatedProfit: 0.012, dexes: ['Raydium', 'Orca'], timestamp: now },
      { id: 'opp-2', pair: 'BONK/SOL', route: ['BONK->SOL->BONK'], estimatedProfit: 0.008, dexes: ['Meteora', 'Raydium'], timestamp: now },
      { id: 'opp-3', pair: 'JUP/USDC', route: ['JUP->USDC->JUP'], estimatedProfit: 0.005, dexes: ['Orca'], timestamp: now },
    ];
    return this.opportunities;
  }
}
