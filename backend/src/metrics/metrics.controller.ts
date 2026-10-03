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
    const result: unknown = await this.metricsService.getSummary(
      req.project.id,
      query.hours,
    );

    return result;
  }

  @Get('trend')
  async getTrend(@Req() req: ProjectRequest, @Query() query: QueryWindowDto) {
    const result: unknown = await this.metricsService.getTrend(
      req.project.id,
      query.hours,
    );

    return result;
  }

  @Get('endpoints')
  async getEndpoints(
    @Req() req: ProjectRequest,
    @Query() query: QueryWindowDto,
  ) {
    const result: unknown = await this.metricsService.getEndpointAnalytics(
      req.project.id,
      query.hours,
    );

    return result;
  }

  @Get('errors')
  async getErrors(@Req() req: ProjectRequest, @Query() query: QueryWindowDto) {
    const result: unknown = await this.metricsService.getErrors(
      req.project.id,
      query.hours,
    );

    return result;
  }

  @Get('traffic')
  async getTraffic(@Req() req: ProjectRequest, @Query() query: QueryWindowDto) {
    const result: unknown = await this.metricsService.getTraffic(
      req.project.id,
      query.hours,
    );

    return result;
  }

  @Get('slow-endpoints')
  async getSlowEndpoints(
    @Req() req: ProjectRequest,
    @Query() query: QueryWindowDto,
  ) {
    const result: unknown = await this.metricsService.getSlowEndpoints(
      req.project.id,
      query.hours,
    );

    return result;
  }

  @Get('anomalies')
  async getAnomalies(
    @Req() req: ProjectRequest,
    @Query() query: QueryWindowDto,
  ) {
    const result: unknown = await this.metricsService.getAnomalies(
      req.project.id,
      query.hours,
    );

    return result;
  }

  @Get('service-health')
  async getServiceHealth(
    @Req() req: ProjectRequest,
    @Query() query: QueryWindowDto,
  ) {
    const result: unknown = await this.metricsService.getServiceHealth(
      req.project.id,
      query.hours,
    );

    return result;
  }

  @Get('sla')
  async getSla(@Req() req: ProjectRequest, @Query() query: QueryWindowDto) {
    const result: unknown = await this.metricsService.getSla(
      req.project.id,
      query.hours,
    );

    return result;
  }

  @Get('cost-estimation')
  async getCostEstimation(
    @Req() req: ProjectRequest,
    @Query() query: QueryWindowDto,
  ) {
    const result: unknown = await this.metricsService.getCostEstimation(
      req.project.id,
      query.hours,
    );

    return result;
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
    const result: unknown = await this.metricsService.getTopFailures(
      req.project.id,
    );

    return result;
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
    const result: unknown = await this.metricsService.getLatencyDistribution(
      req.project.id,
    );

    return result;
  }

  @Get('comparison')
  async getComparison(
    @Req() req: ProjectRequest,
    @Query() query: QueryWindowDto,
  ) {
    const result: unknown = await this.metricsService.getComparison(
      req.project.id,
      query.hours,
    );

    return result;
  }

  @Get('endpoint-detail/:endpoint')
  async getEndpointDetail(
    @Req() req: ProjectRequest,
    @Param('endpoint') endpoint: string,
    @Query() query: QueryWindowDto,
  ) {
    const result: unknown = await this.metricsService.getEndpointDetail(
      req.project.id,
      decodeURIComponent(endpoint),
      query.hours,
    );

    return result;
  }
}
