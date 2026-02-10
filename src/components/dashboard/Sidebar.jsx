"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Sun, Moon } from "lucide-react";
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
import { useTheme } from "@/hooks/useTheme";

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
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      style={{
        width: collapsed ? 72 : 260,
        minHeight: "100vh",
        backgroundColor: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <Link href="/dashboard" className="flex items-center no-underline" style={{ gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "var(--accent-glow)",
            }}
          >
            <Sparkles size={18} color="#fff" />
          </div>
          {!collapsed && (
            <span style={{
              fontSize: 18,
              fontWeight: 400,
              color: "var(--text-primary)",
              letterSpacing: "0.12em",
              fontFamily: "'Instrument Serif', serif",
            }}>
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
            border: "1px solid var(--border-primary)",
            backgroundColor: "transparent",
            color: "var(--text-muted)",
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
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
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
                color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
                backgroundColor: isActive ? "var(--accent-bg)" : "transparent",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              title={collapsed ? item.name : undefined}
            >
              <item.icon size={18} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.55 }} />
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle + User section */}
      <div
        style={{
          padding: collapsed ? "12px 16px" : "12px 20px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Bytt til lys modus" : "Bytt til mørk modus"}
          style={{
            width: collapsed ? 40 : "100%",
            height: 36,
            borderRadius: 8,
            border: "1px solid var(--border-primary)",
            backgroundColor: "var(--bg-input)",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10,
            padding: collapsed ? 0 : "0 12px",
            cursor: "pointer",
            fontSize: 13,
            transition: "all 0.2s ease",
          }}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && (theme === "dark" ? "Lys modus" : "Mørk modus")}
        </button>

        {/* User */}
        <div
          style={{
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
              background: "var(--accent-gradient)",
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
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Min konto</span>
          )}
        </div>
      </div>
    </aside>
  );
}
