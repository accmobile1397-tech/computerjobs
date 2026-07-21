import { AdminMonitoringClient } from "./admin-monitoring-client";

/** P10-012 — monitoring UI via Admin API only (C-005-1 · read-only). */
export default function AdminMonitoringPage() {
  return <AdminMonitoringClient />;
}
