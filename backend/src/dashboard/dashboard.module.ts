import { Module } from "@nestjs/common";

import { MetricsModule } from "../metrics/metrics.module";
import { AlertsModule } from "../alerts/alerts.module";
import { AnomaliesModule } from "../anomalies/anomalies.module";

import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { ProjectsModule } from "src/projects/projects.module";

@Module({
    imports: [
        MetricsModule,
        AlertsModule,
        AnomaliesModule,
        ProjectsModule,
    ],
    controllers: [
        DashboardController,
    ],
    providers: [
        DashboardService,
    ],
})
export class DashboardModule {}