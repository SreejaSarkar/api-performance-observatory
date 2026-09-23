import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import {
  deliverWebhookNotification,
  type WebhookNotificationPayload,
} from './webhook-delivery';
import { DEFAULT_WEBHOOK_PROVIDER } from './webhook.constants';

@Injectable()
export class WebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, dto: CreateWebhookDto) {
    return this.prisma.webhook.create({
      data: {
        projectId,
        name: dto.name?.trim() || null,
        provider: dto.provider ?? DEFAULT_WEBHOOK_PROVIDER,
        url: dto.url,
      },
    });
  }

  async findAll(projectId: string) {
    return this.prisma.webhook.findMany({
      where: {
        projectId,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async sendTest(projectId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const payload: WebhookNotificationPayload = {
      projectId,
      rule: 'Latency threshold smoke test',
      value: 482,
      threshold: 350,
      severity: 'INFO',
      timestamp: new Date(),
      deliveryType: 'TEST',
    };

    await deliverWebhookNotification(webhook, payload);

    return {
      success: true,
    };
  }

  async remove(projectId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return this.prisma.webhook.delete({
      where: {
        id,
      },
    });
  }
}
