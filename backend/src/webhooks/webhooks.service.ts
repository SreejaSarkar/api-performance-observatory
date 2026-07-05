import { Injectable } from "@nestjs/common";

import { PrismaService }
    from "../prisma/prisma.service";

@Injectable()
export class WebhooksService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async create(
        projectId: string,
        url: string,
    ) {
        return this.prisma.webhook.create({
            data: {
                projectId,
                url,
            },
        });
    }

    async findAll(
        projectId: string,
    ) {
        return this.prisma.webhook.findMany({
            where: {
                projectId,
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async remove(
        id: string,
    ) {
        return this.prisma.webhook.delete({
            where: {
                id,
            },
        });
    }
}