import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BotsModule } from './bots/bots.module';
import { ArbitrageModule } from './arbitrage/arbitrage.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [AuthModule, BotsModule, ArbitrageModule, RealtimeModule],
})
export class AppModule {}
