"use client";

import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  learnerName: string;
}

const tabs = [
  { id: "overview", label: "Dashboard", icon: "⬡" },
  { id: "severity", label: "Severity", icon: "◆" },
  { id: "reasoning", label: "AI Reasoning", icon: "⬢" },
  { id: "intervention", label: "Study Plan", icon: "▶" },
];

export function DashboardLayout({ children, activeTab, onTabChange, learnerName }: DashboardLayoutProps) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090b", color: "#fafafa" }}>
      {/* Subtle ambient gradients */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -150, left: -150, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)" }} />
      </div>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid #18181b",
        backgroundColor: "rgba(9,9,11,0.9)",
        backdropFilter: "blur(16px)",
      }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #10b981, #a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 900, fontSize: 14,
              }}>W</div>
              <div>
                <h1 style={{ fontSize: 15, fontWeight: 700, color: "#fafafa", letterSpacing: "-0.02em" }}>
                  Weakness Reasoning <span style={{ color: "#10b981" }}>Engine</span>
                </h1>
                <p style={{ fontSize: 10, color: "#52525b" }}>Bayesian Knowledge Tracing · AI-Powered Analytics</p>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav style={{ display: "flex", gap: 2, height: "100%" }}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    style={{
                      position: "relative", height: "100%",
                      padding: "0 20px",
                      fontSize: 13, fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#fafafa" : "#52525b",
                      backgroundColor: "transparent",
                      border: "none", cursor: "pointer",
                      transition: "color 0.2s",
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#a1a1aa"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#52525b"; }}
                  >
                    <span style={{ fontSize: 11, opacity: isActive ? 1 : 0.5 }}>{tab.icon}</span>
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        style={{
                          position: "absolute", bottom: -1, left: 12, right: 12, height: 2,
                          background: "linear-gradient(90deg, #10b981, #a855f7)",
                          borderRadius: 2,
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                padding: "4px 12px", borderRadius: 6,
                backgroundColor: "#18181b", fontSize: 11, color: "#10b981",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#10b981" }} />
                Live
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #a855f7, #10b981)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff",
              }}>{learnerName.split(" ").map(n => n[0]).join("")}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ position: "relative", zIndex: 10, maxWidth: 1440, margin: "0 auto", padding: "28px 32px 48px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
