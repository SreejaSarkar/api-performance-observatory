import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { ProjectsService } from 'src/projects/projects.service';

type Project = NonNullable<
  Awaited<ReturnType<ProjectsService['findByApiKey']>>
>;

type ApiKeyRequest = Request & {
  project?: Project;
};

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly projectsService: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ApiKeyRequest>();

    const apiKeyHeader = request.headers['x-api-key'];
    const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;

    if (!apiKey) {
      throw new UnauthorizedException('Missing API key');
    }

    const project = await this.projectsService.findByApiKey(String(apiKey));

    if (!project) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.project = project;

    return true;
  }
}
