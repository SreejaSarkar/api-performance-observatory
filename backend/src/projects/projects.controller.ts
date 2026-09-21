import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from "@nestjs/common";

import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import {
  ApiBearerAuth,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/types/auth-user.type";

@ApiTags("Projects")
@ApiBearerAuth("bearer")
@UseGuards(JwtAuthGuard)
@Controller("projects")
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) { }

  @Post()
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.create(
      dto.name,
      user.userId,
    );
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.findAllForUser(
      user.userId,
    );
  }
}