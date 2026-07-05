import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { MetricsService } from './metrics.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { QueryWindowDto } from './dto/query-window.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

type ProjectRequest = Request & {
  project: {
    id: string;
  };
};

@ApiTags('Metrics')
@ApiSecurity('api-key')
@Controller('metrics')
@UseGuards(ApiKeyGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('summary')
  async getSummary(@Req() req: ProjectRequest, @Query() query: QueryWindowDto) {
    return this.metricsService.getSummary(req.project.id, query.hours);
  }

  @Get('trend')
  async getTrend(@Req() req: ProjectRequest, @Query() query: QueryWindowDto) {
    return this.metricsService.getTrend(req.project.id, query.hours);
  }

  @Get('endpoints')
  async getEndpoints(
    @Req() req: ProjectRequest,
    @Query() query: QueryWindowDto,
  ) {
    return this.metricsService.getEndpointAnalytics(
      req.project.id,
      query.hours,
    );
  }

  @Get('errors')
  async getErrors(@Req() req: ProjectRequest, @Query() query: QueryWindowDto) {
    return this.metricsService.getErrors(req.project.id, query.hours);
  }

  @Get('traffic')
  async getTraffic(@Req() req: ProjectRequest, @Query() query: QueryWindowDto) {
    return this.metricsService.getTraffic(req.project.id, query.hours);
  }

  @Get('slow-endpoints')
  async getSlowEndpoints(
    @Req() req: ProjectRequest,
    @Query() query: QueryWindowDto,
  ) {
    return this.metricsService.getSlowEndpoints(req.project.id, query.hours);
  }

  @Get('anomalies')
  async getAnomalies(
    @Req() req: ProjectRequest,
    @Query() query: QueryWindowDto,
  ) {
    return this.metricsService.getAnomalies(req.project.id, query.hours);
  }

  @Get('service-health')
  async getServiceHealth(
    @Req() req: ProjectRequest,
    @Query() query: QueryWindowDto,
  ) {
    return this.metricsService.getServiceHealth(req.project.id, query.hours);
  }

  @Get('sla')
  async getSla(@Req() req: ProjectRequest, @Query() query: QueryWindowDto) {
    return this.metricsService.getSla(req.project.id, query.hours);
  }

  @Get('cost-estimation')
  async getCostEstimation(
    @Req() req: ProjectRequest,
    @Query() query: QueryWindowDto,
  ) {
    return this.metricsService.getCostEstimation(req.project.id, query.hours);
  }

  @Get('top-failures')
  async getTopFailures(
    @Req()
    req: Request & {
      project: {
        id: string;
      };
    },
  ) {
    return this.metricsService.getTopFailures(req.project.id);
  }

  @Get('latency-distribution')
  async getLatencyDistribution(
    @Req()
    req: Request & {
      project: {
        id: string;
      };
    },
  ) {
    return this.metricsService.getLatencyDistribution(req.project.id);
  }

  @Get('comparison')
  async getComparison(
    @Req() req: ProjectRequest,
    @Query() query: QueryWindowDto,
  ) {
    return this.metricsService.getComparison(req.project.id, query.hours);
  }

  @Get('endpoint-detail/:endpoint')
  async getEndpointDetail(
    @Req() req: ProjectRequest,
    @Param('endpoint') endpoint: string,
    @Query() query: QueryWindowDto,
  ) {
    return this.metricsService.getEndpointDetail(
      req.project.id,
      decodeURIComponent(endpoint),
      query.hours,
    );
  }
}
