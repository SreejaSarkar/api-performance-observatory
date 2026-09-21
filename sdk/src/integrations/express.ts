import { Request, Response, NextFunction } from "express";
import { Observatory } from "../client";

export function createExpressMiddleware(
    observatory: Observatory,
) {
    return (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const start = Date.now();

        res.on("finish", () => {
            observatory.track({
                endpoint: req.originalUrl,
                method: req.method,
                latency: Date.now() - start,
                statusCode: res.statusCode,
                userAgent: req.headers["user-agent"],
                responseSize: Number(res.getHeader("content-length")) || undefined,
                requestId: typeof req.headers["x-request-id"] === "string"
                    ? req.headers["x-request-id"]
                    : undefined,
            });
        });

        next();
    };
}