import { Module } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { TradesModule } from '../trades/trades.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TradesModule, RealtimeModule],
  providers: [ExecutionService],
  exports: [ExecutionService],
})
export class ExecutionModule {}
