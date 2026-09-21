"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getAnomalies,
} from "@/lib/anomaly-api";

import {
  Anomaly,
} from "@/types/anomaly";

import AnomalyTable
  from "@/components/anomalies/AnomalyTable";
import ProjectHeader from "@/components/projects/ProjectHeader";
import AnomaliesPageSkeleton from "@/components/anomalies/AnomaliesPageSkeleton";
import ErrorState from "@/components/common/ErrorState";
import { useRequireProject } from "@/lib/useRequireProject";
import { useRealtimeRefresh } from "@/lib/useRealtimeRefresh";
import StickyPageHeader from "@/components/layout/StickyPageHeader";

export default function AnomaliesPage() {
  const hasProject = useRequireProject();
  const [
    anomalies,
    setAnomalies,
  ] =
    useState<
      Anomaly[]
    >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const load =
    async () => {
      try {
        setLoading(true);

        setError("");

        const data =
          await getAnomalies();

        setAnomalies(
          data,
        );
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load anomalies.",
        );
      } finally {
        setLoading(false);
      }
    };

  useRealtimeRefresh(load);

  useEffect(() => {
    if (!hasProject) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasProject]);

  if (!hasProject) {
    return null;
  }

  if (loading) {
    return (
      <AnomaliesPageSkeleton />
    );
  }

  if (error) {
    return (
      <div
        className="
        max-w-7xl
        mx-auto
        px-4 py-4
        md:p-8
      "
      >
        <ErrorState
          message={error}
          onRetry={load}
        />
      </div>
    );
  }

  return (
    <div
      className="
        max-w-7xl
        mx-auto
        px-4 py-4
        md:p-8
        overflow-x-hidden
      "
    >
      <StickyPageHeader>
        <ProjectHeader
          status={
            anomalies.length > 0
              ? "Critical"
              : "Healthy"
          }
          subtitle="Anomaly monitoring and incident response"
        />
      </StickyPageHeader>

      <AnomalyTable
        anomalies={
          anomalies
        }
      />
    </div>
  );
}