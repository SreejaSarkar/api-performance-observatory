"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSocket } from "./useSocket";

export function useRealtimeRefresh(loadFn: () => void) {
  const { socket, connected } = useSocket();
  const lastRefresh = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadFnRef = useRef(loadFn);
  loadFnRef.current = loadFn;

  const debouncedRefresh = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastRefresh.current;

    if (elapsed >= 5000) {
      lastRefresh.current = now;
      loadFnRef.current();
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        lastRefresh.current = Date.now();
        timeoutRef.current = null;
        loadFnRef.current();
      }, 5000 - elapsed);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const projectId = localStorage.getItem("projectId");
    if (!projectId) return;

    const event = `project:${projectId}`;
    socket.on(event, debouncedRefresh);

    return () => {
      socket.off(event, debouncedRefresh);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [socket, debouncedRefresh]);

  return { connected };
}
