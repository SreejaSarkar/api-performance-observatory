import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { ProjectsModule } from "src/projects/projects.module";

@Module({
    imports: [
        PrismaModule,
        ProjectsModule,
    ],
    controllers: [
        ReportsController,
    ],
    providers: [
        ReportsService,
    ],
})
export class ReportsModule {}