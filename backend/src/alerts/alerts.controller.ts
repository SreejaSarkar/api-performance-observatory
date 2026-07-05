import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { ApiKeyGuard } from '../guards/api-key.guard';

import { AlertsService } from './alerts.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Alerts')
@ApiSecurity('api-key')
@Controller('alerts')
@UseGuards(ApiKeyGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('rules')
  async createRule(
    @Req()
    req: Request & {
      project: { id: string };
    },

    @Body()
    dto: CreateAlertRuleDto,
  ) {
    return this.alertsService.createRule(req.project.id, dto);
  }

  @Get('rules')
  async getRules(
    @Req()
    req: Request & {
      project: { id: string };
    },
  ) {
    return this.alertsService.getRules(req.project.id);
  }

  @Delete('rules/:id')
  async deleteRule(
    @Req()
    req: Request & {
      project: { id: string };
    },

    @Param('id')
    ruleId: string,
  ) {
    return this.alertsService.deleteRule(req.project.id, ruleId);
  }

  @Patch('rules/:id')
  async updateRule(
    @Req()
    req: Request & {
      project: { id: string };
    },

    @Param('id')
    ruleId: string,

    @Body()
    dto: CreateAlertRuleDto,
  ) {
    return this.alertsService.updateRule(req.project.id, ruleId, dto);
  }

  @Post('webhooks')
  async createWebhook(
    @Req()
    req: Request & {
      project: { id: string };
    },

    @Body()
    dto: CreateWebhookDto,
  ) {
    return this.alertsService.createWebhook(req.project.id, dto.url);
  }

  @Get('webhooks')
  async getWebhooks(
    @Req()
    req: Request & {
      project: { id: string };
    },
  ) {
    return this.alertsService.getWebhooks(req.project.id);
  }

  @Delete('webhooks/:id')
  async deleteWebhook(
    @Req()
    req: Request & {
      project: { id: string };
    },

    @Param('id')
    webhookId: string,
  ) {
    return this.alertsService.deleteWebhook(req.project.id, webhookId);
  }

  @Get('events')
  async getEvents(@Req() req: any) {
    return this.alertsService.getEvents(req.project.id);
  }

  @Get('stats')
  async getStats(
    @Req()
    req: Request & {
      project: {
        id: string;
      };
    },
  ) {
    return this.alertsService.getStats(req.project.id);
  }

  @Post('events/:id/ack')
  async acknowledgeEvent(
    @Req()
    req: Request & {
      project: {
        id: string;
      };
    },

    @Param('id')
    eventId: string,
  ) {
    return this.alertsService.acknowledgeEvent(req.project.id, eventId);
  }

  @Post('events/:id/resolve')
  async resolveEvent(
    @Req()
    req: Request & {
      project: {
        id: string;
      };
    },

    @Param('id')
    eventId: string,
  ) {
    return this.alertsService.resolveEvent(req.project.id, eventId);
  }
}
