"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSelectedProject } from "./selected-project";
import { useSocket } from "./useSocket";

export function useRealtimeRefresh(loadFn: () => void) {
  const { socket, connected } = useSocket();
  const selectedProject = useSelectedProject();
  const lastRefresh = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadFnRef = useRef(loadFn);

  useEffect(() => {
    loadFnRef.current = loadFn;
  }, [loadFn]);

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

    const projectId = selectedProject?.id;
    if (!projectId) return;

    const event = `project:${projectId}`;
    socket.on(event, debouncedRefresh);

    return () => {
      socket.off(event, debouncedRefresh);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [socket, selectedProject?.id, debouncedRefresh]);

  return { connected };
}
