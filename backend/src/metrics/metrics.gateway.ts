import {
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";

import { Server } from "socket.io";

@WebSocketGateway({
  cors: true,
})
export class MetricsGateway {
  @WebSocketServer()
  server!: Server;

  emitMetric(
    projectId: string,
    metric: any,
  ) {
    this.server.emit(
      `project:${projectId}`,
      metric,
    );
  }
}