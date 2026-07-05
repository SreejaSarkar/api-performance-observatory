import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { ApiKeyGuard } from '../guards/api-key.guard';

import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { BatchMetricDto } from './dto/batch-metric.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

type ProjectRequest = Request & {
  project: {
    id: string;
  };
};

@ApiTags('MetricsIngestion')
@ApiHeader({
  name: 'x-api-key',
  required: true,
})
@Controller('ingestion')
export class MetricsIngestionController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post('metric')
  @UseGuards(ApiKeyGuard)
  async ingestMetric(@Body() dto: CreateMetricDto, @Req() req: ProjectRequest) {
    console.log('Metric received:', dto);
    return this.metricsService.createMetric(dto, req.project.id);
  }

  @Post('batch')
  @UseGuards(ApiKeyGuard)
  async batchIngest(@Body() dto: BatchMetricDto, @Req() req: ProjectRequest) {
    return this.metricsService.createMany(dto.metrics, req.project.id);
  }
}
