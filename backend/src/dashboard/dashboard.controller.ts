import {
    Controller,
    Get,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";

import { Request } from "express";

import { ApiKeyGuard } from "../guards/api-key.guard";

import { DashboardService } from "./dashboard.service";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";

@ApiTags("Dashboard")
@ApiSecurity("api-key")
@Controller("dashboard")
@UseGuards(ApiKeyGuard)
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
    ) { }

    @Get()
    async getDashboard(
        @Req()
        req: Request & {
            project: {
                id: string;
            };
        },

        @Query("hours")
        hours?: string,
    ) {
        return this.dashboardService.getDashboard(
            req.project.id,
            Number(hours) || 72,
        );
    }
}