# API Observatory SDK

TypeScript SDK for sending API performance metrics to API Performance Observatory.

It supports:

- direct metric submission with `trackMetric()`
- buffered batching with the `Observatory` client
- Express middleware integration
- NestJS interceptor integration

## Package

```text
@sreejasarkar/api-observatory
```

## Requirements

- Node.js `18+`
- A valid Observatory API key

## Install From GitHub Packages

GitHub Packages requires scoped registry configuration and authentication.

### Bash

```bash
echo "@sreejasarkar:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc
npm install @sreejasarkar/api-observatory
```

### PowerShell

```powershell
Add-Content .npmrc "@sreejasarkar:registry=https://npm.pkg.github.com"
Add-Content .npmrc "//npm.pkg.github.com/:_authToken=${env:GITHUB_TOKEN}"
npm install @sreejasarkar/api-observatory
```

Your `GITHUB_TOKEN` should have package read permission for installation and package write permission for publishing.

## Quick Start

```ts
import { Observatory } from "@sreejasarkar/api-observatory";

const observatory = new Observatory({
    apiKey: process.env.OBSERVATORY_API_KEY!,
    serverUrl: process.env.OBSERVATORY_SERVER_URL,
    environment: process.env.NODE_ENV,
    batchSize: 20,
    flushInterval: 5000,
    timeout: 5000,
    maxRetries: 3,
    maxQueueSize: 1000,
    debug: process.env.NODE_ENV !== "production",
});

observatory.track({
    endpoint: "/users",
    method: "GET",
    latency: 184,
    statusCode: 200,
    requestId: "req_123",
    metadata: {
        service: "users-api",
        routeGroup: "users",
    },
});
```

If `serverUrl` is omitted, the SDK uses its hosted default backend URL. The standalone helper also checks `OBSERVATORY_SERVER_URL` automatically.

## Direct Metric Submission

Use `trackMetric()` when you want to send a single metric without holding a long-lived client instance.

```ts
import { trackMetric } from "@sreejasarkar/api-observatory";

await trackMetric({
    apiKey: process.env.OBSERVATORY_API_KEY!,
    serverUrl: process.env.OBSERVATORY_SERVER_URL,
    environment: process.env.NODE_ENV,
    endpoint: "/users",
    method: "GET",
    latency: 250,
    statusCode: 200,
    requestId: "req_123",
    responseSize: 1024,
    userAgent: "internal-job",
    metadata: {
        service: "users-api",
    },
});
```

## Express Integration

```ts
import express from "express";
import { Observatory } from "@sreejasarkar/api-observatory";

const observatory = new Observatory({
    apiKey: process.env.OBSERVATORY_API_KEY!,
    serverUrl: process.env.OBSERVATORY_SERVER_URL,
});

const app = express();

app.use(observatory.express());
```

The Express middleware captures:

- `endpoint`
- `method`
- `latency`
- `statusCode`
- `userAgent`
- `responseSize`
- `requestId` from `x-request-id`

## NestJS Integration

```ts
import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { Observatory } from "@sreejasarkar/api-observatory";

const observatory = new Observatory({
    apiKey: process.env.OBSERVATORY_API_KEY!,
    serverUrl: process.env.OBSERVATORY_SERVER_URL,
});

@Module({
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useValue: observatory.nest(),
        },
    ],
})
export class AppModule {}
```

The NestJS interceptor records metrics during `finalize()`, so failed controller executions are still captured.

## Configuration Reference

### `ObservatoryConfig`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `apiKey` | `string` | Yes | Observatory API key |
| `serverUrl` | `string` | No | Overrides the hosted default backend |
| `environment` | `string` | No | Defaults to `NODE_ENV` or `production` |
| `batchSize` | `number` | No | Number of queued metrics per flush |
| `flushInterval` | `number` | No | Background flush interval in milliseconds |
| `timeout` | `number` | No | Request timeout in milliseconds |
| `maxRetries` | `number` | No | Retry attempts for failed sends |
| `maxQueueSize` | `number` | No | Max in-memory queue size before dropping metrics |
| `debug` | `boolean` | No | Enables internal debug logging |
| `onError` | `(error) => void` | No | Called when a batch permanently fails |
| `onDrop` | `(metric, reason) => void` | No | Called when a metric is dropped because the queue is full |

### `MetricData`

| Field | Type | Required |
| --- | --- | --- |
| `endpoint` | `string` | Yes |
| `method` | `string` | Yes |
| `latency` | `number` | Yes |
| `statusCode` | `number` | Yes |
| `timestamp` | `string` | No |
| `requestId` | `string` | No |
| `responseSize` | `number` | No |
| `userAgent` | `string` | No |
| `environment` | `string` | No |
| `metadata` | `Record<string, unknown>` | No |

## Reliability Behavior

- Metrics stay in memory until a batch send succeeds.
- Concurrent `flush()` calls are serialized.
- Retries use exponential backoff with jitter.
- `Retry-After` is respected for `429` and other retryable status codes.
- Queue growth is bounded by `maxQueueSize`.
- Dropped metrics can be observed with `onDrop`.
- Permanent send failures can be observed with `onError`.

## Stats And Shutdown

```ts
const stats = observatory.getStats();

console.log(stats);
// {
//   queued: 2,
//   sent: 124,
//   failed: 0,
//   dropped: 1,
//   retries: 3,
// }

await observatory.flush();
await observatory.shutdown();
```

Call `shutdown()` during application termination so queued metrics are flushed before exit.

## Publishing

From the `sdk` directory:

```bash
npm version patch
npm publish
```

The package uses:

- `prepublishOnly` to run `npm run build`
- `publishConfig.registry` set to GitHub Packages
- `.npmrc` scoped to `@sreejasarkar`

## Security Notes

Avoid putting secrets or personal data into:

- `metadata`
- request headers
- cookies
- request bodies

Keep captured fields operational and non-sensitive.

## Repository

- Homepage: https://api-performance-observatory.vercel.app
- Repository: https://github.com/SreejaSarkar/api-performance-observatory
- Issues: https://github.com/SreejaSarkar/api-performance-observatory/issues