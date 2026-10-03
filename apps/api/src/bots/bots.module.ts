import { Module } from '@nestjs/common';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';
import { AuthModule } from '../auth/auth.module';
import { ExecutionModule } from '../execution/execution.module';
import { TradesModule } from '../trades/trades.module';

@Module({
  imports: [AuthModule, ExecutionModule, TradesModule],
  controllers: [BotsController],
  providers: [BotsService],
  exports: [BotsService],
})
export class BotsModule {}
