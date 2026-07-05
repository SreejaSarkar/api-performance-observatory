import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import { ProjectsModule } from "../projects/projects.module";

import { AnomaliesController } from "./anomalies.controller";
import { AnomaliesService } from "./anomalies.service";
import { AnomalyDetectionService } from "./anomaly-detection.service";

@Module({
    imports: [
        PrismaModule,
        ProjectsModule,
    ],
    controllers: [
        AnomaliesController,
    ],
    providers: [
        AnomaliesService,
        AnomalyDetectionService,
    ],
    exports: [
        AnomaliesService,
    ],
})
export class AnomaliesModule {}