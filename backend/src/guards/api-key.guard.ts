import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { ProjectsService } from "src/projects/projects.service";

@Injectable()
export class ApiKeyGuard
    implements CanActivate {
    constructor(
        private readonly prisma: PrismaService,
        private readonly projectsService: ProjectsService
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request =
            context.switchToHttp().getRequest();

        const apiKey =
            request.headers["x-api-key"];

        if (!apiKey) {
            throw new UnauthorizedException(
                "Missing API key",
            );
        }

        const project =
            await this.projectsService.findByApiKey(
                String(apiKey),
            );

        if (!project) {
            throw new UnauthorizedException(
                "Invalid API key",
            );
        }

        request.project = project;

        return true;
    }
}