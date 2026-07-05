"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getStats,
  getRules,
  getEvents,
  acknowledge,
  resolve,
  createRule,
  deleteRule,
  updateRule,
} from "@/lib/alerts-api";

import AlertRuleTable
  from "@/components/alerts/AlertRuleTable";

import AlertEventTable
  from "@/components/alerts/AlertEventTable";

import {
  AlertEvent,
  AlertRule,
  AlertStats,
} from "@/types/alerts";

import MetricCard
  from "@/components/dashboard/MetricCard";
import ProjectHeader from "@/components/projects/ProjectHeader";
import {
  Bell,
  Siren,
  TriangleAlert,
  AlertCircle,
} from "lucide-react";
import AlertsPageSkeleton from "@/components/common/AlertsPageSkeleton";
import ErrorState
  from "@/components/common/ErrorState";
import { toast } from "react-hot-toast";
import CreateAlertRuleModal from "@/components/alerts/CreateAlertRuleModal";
import { useRequireProject } from "@/lib/useRequireProject";

export default function AlertsPage() {
  useRequireProject();
  const [
    stats,
    setStats,
  ] = useState<AlertStats>({
    totalAlerts: 0,
    todayAlerts: 0,
    criticalAlerts: 0,
    acknowledgedAlerts: 0,
    unacknowledgedAlerts: 0,
    resolvedAlerts: 0,
    openAlerts: 0,
  });

  const [
    rules,
    setRules,
  ] =
    useState<AlertRule[]>(
      [],
    );

  const [
    events,
    setEvents,
  ] =
    useState<AlertEvent[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [editingRule, setEditingRule] =
    useState<AlertRule | null>(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [ruleName, setRuleName] =
    useState("");

  const [metric, setMetric] =
    useState("LATENCY");

  const [threshold, setThreshold] =
    useState(500);

  const [severity, setSeverity] =
    useState("MEDIUM");

  const loadData =
    async () => {
      try {
        setLoading(true);

        setError("");

        const [
          statsData,
          rulesData,
          eventsData,
        ] =
          await Promise.all([
            getStats(),
            getRules(),
            getEvents(),
          ]);

        setStats(
          statsData,
        );

        setRules(
          rulesData,
        );

        setEvents(
          eventsData,
        );
      } catch {
        setError(
          "Failed to load alerts dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRule = async () => {
    try {
      if (editingRule) {
        await updateRule(editingRule.id, {
          name: ruleName,
          metric,
          threshold,
          severity,
        });

        toast.success("Alert rule updated");
      } else {
        await createRule({
          name: ruleName,
          metric,
          threshold,
          severity,
        });

        toast.success("Alert rule created");
      }

      setShowCreateModal(false);

      setEditingRule(null);

      setRuleName("");
      setMetric("LATENCY");
      setThreshold(500);
      setSeverity("MEDIUM");

      await loadData();
    } catch {
      toast.error(
        editingRule
          ? "Failed to update alert rule"
          : "Failed to create alert rule",
      );
    }
  };

  const handleEditRule = (
    rule: AlertRule,
  ) => {
    setEditingRule(rule);

    setRuleName(rule.name);
    setMetric(rule.metric);
    setThreshold(rule.threshold);
    setSeverity(rule.severity);

    setShowCreateModal(true);
  };

  const handleDeleteRule = async (id: string) => {
    await deleteRule(id);

    setRules((prev) =>
      prev.filter((rule) => rule.id !== id)
    );
  };

  const handleAck =
    async (
      id: string,
    ) => {
      try {
        await acknowledge(
          id,
        );

        toast.success(
          "Alert acknowledged",
        );

        await loadData();
      } catch {
        toast.error(
          "Failed to acknowledge alert",
        );
      }
    };

  const handleResolve =
    async (
      id: string,
    ) => {
      try {
        await resolve(
          id,
        );

        toast.success(
          "Alert resolved",
        );

        await loadData();
      } catch {
        toast.error(
          "Failed to resolve alert",
        );
      }
    };

  if (loading) {
    return (
      <AlertsPageSkeleton />
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
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <>
      <div
        className="
        max-w-7xl
        mx-auto
        px-4 py-4
        md:p-8
      "
      >
        <ProjectHeader
          projectName="Project 5"
          status={
            stats.openAlerts > 0
              ? "Critical"
              : "Healthy"
          }
          subtitle="Alert monitoring and incident response"
        />

        {/* Stats */}
        <div
          className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-4
          mb-8
        "
        >
          <MetricCard
            title="Total Alerts"
            value={
              stats.totalAlerts
            }
            borderColor="border-purple-500/40"
            icon={
              <Bell
                className="
            w-7
            h-7
            text-purple-400
        "
              />
            }
          />

          <MetricCard
            title="Today"
            value={
              stats.todayAlerts
            }
            borderColor="border-blue-500/40"
            icon={
              <TriangleAlert
                className="
            w-7
            h-7
            text-blue-400
        "
              />
            }
          />

          <MetricCard
            title="Critical"
            value={
              stats.criticalAlerts
            }
            borderColor="border-red-500/40"
            icon={
              <Siren
                className="
            w-7
            h-7
            text-red-400
        "
              />
            }
          />

          <MetricCard
            title="Open"
            value={
              stats.openAlerts
            }
            borderColor="border-yellow-500/40"
            icon={
              <AlertCircle
                className="
            w-7
            h-7
            text-yellow-400
        "
              />
            }
          />
        </div>

        {/* Rules */}
        <div
          className="
    overflow-hidden
    mb-8
  "
        >
          <div
            className="
    flex
    justify-end
    mb-4
  "
          >
            <button
              onClick={() =>
                setShowCreateModal(true)
              }
              className="
      px-4
      py-2
      bg-blue-600
      rounded-lg
      text-white
      hover:bg-blue-700
    "
            >
              + Create Alert Rule
            </button>
          </div>
          <AlertRuleTable
            rules={rules}
            onDelete={handleDeleteRule}
            onEdit={handleEditRule}
          />
        </div>

        {/* Events */}
        <AlertEventTable
          events={events}
          onAck={
            handleAck
          }
          onResolve={
            handleResolve
          }
        />
      </div>
      {showCreateModal && (
        <CreateAlertRuleModal
          ruleName={ruleName}
          setRuleName={setRuleName}
          metric={metric}
          setMetric={setMetric}
          threshold={threshold}
          setThreshold={setThreshold}
          severity={severity}
          setSeverity={setSeverity}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRule(null);
          }}
          onCreate={handleCreateRule}
          isEditing={!!editingRule}
        />
      )}
    </>
  );
}