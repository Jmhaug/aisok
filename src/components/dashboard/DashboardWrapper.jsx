"use client";

import { DashboardProvider } from "@/lib/dashboard-context";

export default function DashboardWrapper({ children }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
