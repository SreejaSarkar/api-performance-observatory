"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";

let sharedSocket: Socket | null = null;
let refCount = 0;

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!sharedSocket) {
      sharedSocket = io(SOCKET_URL, {
        transports: ["websocket"],
        autoConnect: true,
      });
    }

    refCount++;
    const s = sharedSocket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    if (s.connected) {
      setConnected(true);
    }

    setSocket(s);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      refCount--;
      if (refCount === 0) {
        s.disconnect();
        sharedSocket = null;
      }
    };
  }, []);

  return { socket, connected };
}
