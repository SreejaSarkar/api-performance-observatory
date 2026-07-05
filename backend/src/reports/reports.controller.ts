import {
    Controller,
    Get,
    Query,
    Req,
    Res,
    UseGuards,
} from "@nestjs/common";

import type { Request, Response } from "express";

import { ApiKeyGuard } from "../guards/api-key.guard";

import { ReportsService } from "./reports.service";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";

@ApiTags("Reports")
@ApiSecurity("api-key")
@Controller("reports")
@UseGuards(ApiKeyGuard)
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
    ) { }

    @Get("export")
    async export(
        @Req()
        req: Request & {
            project: {
                id: string;
            };
        },
        @Res() res: Response,
        @Query("hours") hours?: string,
        @Query("format") format?: string,
    ) {
        const projectId = req.project.id;
        const h = Number(hours) || 72;
        const fmt = format || "csv";

        switch (fmt) {
            case "json": {
                const data = await this.reportsService.exportJson(projectId, h);
                res.setHeader("Content-Type", "application/json");
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="report-${h}h.json"`,
                );
                return res.send(data);
            }
            case "pdf": {
                const buffer = await this.reportsService.exportPdf(projectId, h);
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="report-${h}h.pdf"`,
                );
                return res.send(buffer);
            }
            case "csv":
            default: {
                const csv = await this.reportsService.exportCsv(projectId, h);
                res.setHeader("Content-Type", "text/csv");
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="report-${h}h.csv"`,
                );
                return res.send(csv);
            }
        }
    }
}