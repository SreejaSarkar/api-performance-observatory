import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';

import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { MetricsModule } from 'src/metrics/metrics.module';

@Module({
  imports: [PrismaModule, ProjectsModule, MetricsModule],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
