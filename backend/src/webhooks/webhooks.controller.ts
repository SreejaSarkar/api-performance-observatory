import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";

import {
    ApiSecurity,
    ApiTags,
} from "@nestjs/swagger";

import { ApiKeyGuard }
    from "../guards/api-key.guard";

import { WebhooksService }
    from "./webhooks.service";

import { CreateWebhookDto }
    from "./dto/create-webhook.dto";

@ApiTags("Webhooks")
@ApiSecurity("api-key")
@Controller("webhooks")
@UseGuards(ApiKeyGuard)
export class WebhooksController {
    constructor(
        private readonly webhooksService: WebhooksService,
    ) {}

    @Get()
    findAll(
        @Req() req: any,
    ) {
        return this.webhooksService.findAll(
            req.project.id,
        );
    }

    @Post()
    create(
        @Req() req: any,

        @Body()
        dto: CreateWebhookDto,
    ) {
        return this.webhooksService.create(
            req.project.id,
            dto.url,
        );
    }

    @Delete(":id")
    remove(
        @Param("id")
        id: string,
    ) {
        return this.webhooksService.remove(
            id,
        );
    }
}