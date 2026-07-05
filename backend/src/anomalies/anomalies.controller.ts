import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { ApiKeyGuard } from '../guards/api-key.guard';

import { AnomaliesService } from './anomalies.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Anomalies')
@ApiSecurity('api-key')
@Controller('anomalies')
@UseGuards(ApiKeyGuard)
export class AnomaliesController {
  constructor(private readonly anomaliesService: AnomaliesService) {}

  @Get('history')
  async getHistory(
    @Req()
    req: Request & {
      project: { id: string };
    },
  ) {
    return this.anomaliesService.getHistory(req.project.id);
  }
}
