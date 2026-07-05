import { Module }
    from "@nestjs/common";

import { PrismaModule }
    from "../prisma/prisma.module";

import { WebhooksController }
    from "./webhooks.controller";

import { WebhooksService }
    from "./webhooks.service";
import { ProjectsModule } from "src/projects/projects.module";

@Module({
    imports: [
        PrismaModule,
        ProjectsModule,
    ],

    controllers: [
        WebhooksController,
    ],

    providers: [
        WebhooksService,
    ],
})
export class WebhooksModule {}