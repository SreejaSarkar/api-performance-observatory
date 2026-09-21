import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { ProjectRole } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(
    name: string,
    userId: string,
  ) {
    return this.prisma.project.create({
      data: {
        name,
        apiKey: randomUUID(),
        memberships: {
          create: {
            userId,
            role: ProjectRole.OWNER,
          },
        },
      },
      include: {
        memberships: true,
      },
    });
  }

  async findByApiKey(apiKey: string) {
    return this.prisma.project.findUnique({
      where: {
        apiKey,
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.project.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        memberships: {
          where: {
            userId,
          },
          select: {
            role: true,
          },
        },
      },
    });
  }
}