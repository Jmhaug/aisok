import Sidebar from "@/components/dashboard/Sidebar";
import DashboardWrapper from "@/components/dashboard/DashboardWrapper";

export const metadata = {
  title: "Dashboard — LGPSM",
};

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-page)" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto" }}>
        <DashboardWrapper>{children}</DashboardWrapper>
      </main>
    </div>
  );
}
