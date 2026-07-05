import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnomaliesService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(projectId: string) {
    return this.prisma.anomaly.findMany({
      where: {
        projectId,
      },
      orderBy: {
        detectedAt: 'desc',
      },
      take: 100,
    });
  }

  async getActive(projectId: string) {
    return this.prisma.anomaly.findMany({
      where: {
        projectId,
        resolved: false,
      },
      orderBy: {
        detectedAt: 'desc',
      },
    });
  }
}
