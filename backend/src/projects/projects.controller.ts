import {
  Body,
  Controller,
  Get,
  Post,
} from "@nestjs/common";

import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Projects")
@Controller("projects")
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) { }

  @Post()
  async create(
    @Body() dto: CreateProjectDto,
  ) {
    console.log('dto:', dto);
    return this.projectsService.create(
      dto.name,
    );
  }

  @Get()
  async findAll() {
    return this.projectsService.findAll();
  }
}