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

export default function AnomaliesPage() {
  useRequireProject();
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
      } catch (err: any) {
        setError(
          err?.message ||
          "Failed to load anomalies.",
        );
      } finally {
        setLoading(false);
      }
    };

  useRealtimeRefresh(load);

  useEffect(() => {
    load();
  }, []);

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
      <ProjectHeader
        projectName="Project 5"
        status={
          anomalies.length > 0
            ? "Critical"
            : "Healthy"
        }
        subtitle="Anomaly monitoring and incident response"
      />

      <AnomalyTable
        anomalies={
          anomalies
        }
      />
    </div>
  );
}