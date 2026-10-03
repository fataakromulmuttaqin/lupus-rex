import { Module } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { TradesModule } from '../trades/trades.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [TradesModule, RealtimeModule, PrismaModule],
  providers: [ExecutionService],
  exports: [ExecutionService],
})
export class ExecutionModule {}
