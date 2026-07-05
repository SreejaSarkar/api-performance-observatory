import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(name: string) {
    return this.prisma.project.create({
      data: {
        name,
        apiKey: randomUUID(),
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

  async findAll() {
    return this.prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}