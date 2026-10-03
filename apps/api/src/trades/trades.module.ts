import { Module } from '@nestjs/common';
import { TradesService } from './trades.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TradesService],
  exports: [TradesService],
})
export class TradesModule {}
