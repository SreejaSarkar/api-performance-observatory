"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let sharedSocket: Socket | null = null;
let refCount = 0;
let hasLoggedMissingSocketUrl = false;

function resolveSocketUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  if (
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ) {
    return "http://localhost:3001";
  }

  return null;
}

export function useSocket() {
  const [connected, setConnected] = useState(() => sharedSocket?.connected ?? false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketUrl = resolveSocketUrl();

    if (!socketUrl) {
      if (!hasLoggedMissingSocketUrl) {
        hasLoggedMissingSocketUrl = true;
        console.warn(
          "[Observatory] NEXT_PUBLIC_API_URL is not configured for this deployment. Realtime socket is disabled.",
        );
      }

      return;
    }

    if (!sharedSocket) {
      sharedSocket = io(socketUrl, {
        transports: ["websocket"],
        autoConnect: true,
        withCredentials: true,
      });
    }

    refCount++;
    const s = sharedSocket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onConnectError = () => setConnected(false);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);

    setSocket(s);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onConnectError);
      refCount--;
      if (refCount === 0) {
        s.disconnect();
        sharedSocket = null;
      }
    };
  }, []);

  return { socket, connected };
}
