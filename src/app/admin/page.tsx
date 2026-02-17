"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalSessions: number;
  totalRevenue: number;
  totalUniverses: number;
  totalBoxes: number;
  totalItems: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const cards = stats
    ? [
        { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: "💰", color: "#6BCB77" },
        { label: "Total Orders", value: stats.totalOrders, icon: "📦", color: "#FF6B6B" },
        { label: "Pending Orders", value: stats.pendingOrders, icon: "⏳", color: "#FFD93D" },
        { label: "Completed Sessions", value: stats.totalSessions, icon: "🎯", color: "#4ECDC4" },
        { label: "Universes", value: stats.totalUniverses, icon: "🌌", color: "#7B2FF7" },
        { label: "Boxes", value: stats.totalBoxes, icon: "📦", color: "#E63946" },
        { label: "Items", value: stats.totalItems, icon: "🌟", color: "#00B4D8" },
      ]
    : [];

  return (
    <div>
      <h1
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 28,
          fontWeight: 700,
          margin: "0 0 8px",
        }}
      >
        Dashboard
      </h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 32px" }}>
        Overview of your Double Mystery business
      </p>

      {!stats ? (
        <div style={{ color: "rgba(255,255,255,0.3)", padding: 40, textAlign: "center" }}>
          Loading...
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {cards.map((card) => (
              <div
                key={card.label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {card.label}
                  </span>
                  <span style={{ fontSize: 20 }}>{card.icon}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: card.color, fontFamily: "'Fredoka', sans-serif" }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Link
              href="/admin/orders"
              style={{
                padding: "12px 24px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                color: "#fff",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              View Orders →
            </Link>
            <Link
              href="/admin/universes"
              style={{
                padding: "12px 24px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                color: "#fff",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Manage Universes →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
