"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  BarChart3,
  Search,
  Users,
  Settings,
  FileText,
  CreditCard,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const navigation = [
  { name: "Oversikt", href: "/dashboard", icon: LayoutDashboard },
  { name: "Merkevarer", href: "/dashboard/brands", icon: Building2 },
  { name: "Omtaler", href: "/dashboard/mentions", icon: MessageSquare },
  { name: "Analyse", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Søk & Prompts", href: "/dashboard/prompts", icon: Search },
  { name: "Konkurrenter", href: "/dashboard/competitors", icon: Users },
  { name: "Automatisering", href: "/dashboard/automation", icon: Clock },
  { name: "Rapporter", href: "/dashboard/reports", icon: FileText },
  { name: "Abonnement", href: "/dashboard/billing", icon: CreditCard },
  { name: "Innstillinger", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? 72 : 260,
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "20px 16px" : "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/dashboard" className="flex items-center no-underline" style={{ gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles size={18} color="#fff" />
          </div>
          {!collapsed && (
            <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
              LGPSM
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "transparent",
            color: "rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="no-underline"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "10px 14px" : "10px 14px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                backgroundColor: isActive ? "rgba(167,139,250,0.12)" : "transparent",
                transition: "all 0.15s ease",
              }}
              title={collapsed ? item.name : undefined}
            >
              <item.icon size={18} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div
        style={{
          padding: collapsed ? "16px" : "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9999,
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
          }}
        >
          JH
        </div>
        {!collapsed && (
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Min konto</span>
        )}
      </div>
    </aside>
  );
}
