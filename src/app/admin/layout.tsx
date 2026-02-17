"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/universes", label: "Universes", icon: "🌌" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0f" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "rgba(255,255,255,0.03)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "24px 0",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 20px 24px" }}>
          <div
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 50%, #6BCB77 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            DOUBLE MYSTERY
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginTop: 2,
            }}
          >
            Admin Panel
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 20px",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                  background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                  borderLeft: isActive
                    ? "3px solid #FF6B6B"
                    : "3px solid transparent",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "'Nunito', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "24px 20px 0", marginTop: "auto" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: "32px 40px",
          overflowY: "auto",
          color: "#fff",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {children}
      </main>
    </div>
  );
}
