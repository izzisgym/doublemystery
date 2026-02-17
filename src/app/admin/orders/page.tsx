"use client";

import { useState, useEffect } from "react";

interface Order {
  id: string;
  customerName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  session: {
    rerollCount: number;
    selectedBox: {
      name: string;
      img: string;
      universe: { name: string; emoji: string; color: string };
    } | null;
    selectedItem: { name: string } | null;
  };
}

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered"];
const STATUS_COLORS: Record<string, string> = {
  pending: "#FFD93D",
  processing: "#4ECDC4",
  shipped: "#00B4D8",
  delivered: "#6BCB77",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    fetchOrders();
  };

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.3)", padding: 40, textAlign: "center" }}>
        Loading orders...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 700, margin: 0 }}>
            Orders
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "4px 0 0" }}>
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: "60px 40px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, fontWeight: 600 }}>
            No orders yet
          </div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 4 }}>
            Orders will appear here when customers complete purchases
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "20px 24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                    {order.customerName}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                    {order.streetAddress}, {order.city}, {order.state} {order.zipCode}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#6BCB77",
                      fontFamily: "'Fredoka', sans-serif",
                    }}
                  >
                    ${order.totalAmount.toFixed(2)}
                  </div>
                  {order.session.rerollCount > 0 && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                      {order.session.rerollCount} reroll{order.session.rerollCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              >
                {order.session.selectedBox && (
                  <>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Universe:</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {order.session.selectedBox.universe.emoji} {order.session.selectedBox.universe.name}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Box:</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {order.session.selectedBox.img} {order.session.selectedBox.name}
                    </span>
                  </>
                )}
                {order.session.selectedItem && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Item:</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      🌟 {order.session.selectedItem.name}
                    </span>
                  </>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginRight: 4 }}>Status:</span>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(order.id, s)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: order.status === s
                        ? `2px solid ${STATUS_COLORS[s]}`
                        : "1px solid rgba(255,255,255,0.08)",
                      background: order.status === s
                        ? `${STATUS_COLORS[s]}22`
                        : "rgba(255,255,255,0.03)",
                      color: order.status === s ? STATUS_COLORS[s] : "rgba(255,255,255,0.4)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "capitalize",
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
