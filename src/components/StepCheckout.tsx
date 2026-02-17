"use client";

import { useState } from "react";

interface CheckoutProps {
  universe: { name: string; emoji: string; color: string; gradient: string };
  box: { name: string; img: string } | null;
  item: { name: string; imageUrl?: string | null } | null;
  rerollCount: number;
  totalSpent: number;
  sessionId: string;
  onStartOver: () => void;
}

export default function StepCheckout({
  universe,
  box,
  item,
  rerollCount,
  totalSpent,
  sessionId,
  onStartOver,
}: CheckoutProps) {
  const [showAddress, setShowAddress] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleSubmitOrder = async () => {
    if (
      !form.customerName ||
      !form.streetAddress ||
      !form.city ||
      !form.state ||
      !form.zipCode
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ...form }),
      });

      if (res.ok) {
        setOrderPlaced(true);
        setShowAddress(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showAddress && !orderPlaced) {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 48,
            marginTop: 20,
            marginBottom: 16,
            animation: "bounceIn 0.6s ease both",
          }}
        >
          🎊
        </div>
        <h2
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: 26,
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 8px",
          }}
        >
          Where should we ship?
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 14,
            margin: "0 0 24px",
          }}
        >
          Enter your shipping address to complete your order
        </p>

        {/* Shipping Form */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 20,
            padding: "24px",
            border: "1px solid rgba(255,255,255,0.08)",
            textAlign: "left",
            marginBottom: 24,
          }}
        >
          {[
            { key: "customerName", label: "Full Name", placeholder: "John Doe" },
            {
              key: "streetAddress",
              label: "Street Address",
              placeholder: "123 Main St",
            },
            { key: "city", label: "City", placeholder: "Los Angeles" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 6,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {label}
              </div>
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 15,
                  fontFamily: "'Nunito', sans-serif",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.25)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.08)")
                }
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 6,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                State
              </div>
              <input
                type="text"
                value={form.state}
                onChange={(e) =>
                  setForm((f) => ({ ...f, state: e.target.value }))
                }
                placeholder="CA"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 15,
                  fontFamily: "'Nunito', sans-serif",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 6,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                ZIP Code
              </div>
              <input
                type="text"
                value={form.zipCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, zipCode: e.target.value }))
                }
                placeholder="90001"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 15,
                  fontFamily: "'Nunito', sans-serif",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmitOrder}
          disabled={
            isSubmitting ||
            !form.customerName ||
            !form.streetAddress ||
            !form.city ||
            !form.state ||
            !form.zipCode
          }
          style={{
            width: "100%",
            padding: "16px 24px",
            background: universe.gradient,
            border: "none",
            borderRadius: 16,
            fontSize: 16,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'Fredoka', sans-serif",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            boxShadow: `0 6px 24px ${universe.color}44`,
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? "Placing Order..." : "🚀 Complete Order"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: 80,
          marginTop: 20,
          marginBottom: 16,
          animation: "bounceIn 0.6s ease both",
        }}
      >
        🎊
      </div>
      <h2
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 30,
          fontWeight: 700,
          color: "#fff",
          margin: "0 0 8px",
        }}
      >
        You&apos;re All Set!
      </h2>
      <p
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 14,
          margin: "0 0 28px",
        }}
      >
        Your mystery loot is heading your way
      </p>

      {/* Order Summary */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 20,
          padding: "24px",
          border: "1px solid rgba(255,255,255,0.08)",
          textAlign: "left",
          marginBottom: 24,
          animation: "slideUp 0.5s ease 0.2s both",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          ORDER SUMMARY
        </div>
        {[
          {
            label: "Universe",
            value: universe.name,
            emoji: universe.emoji,
          },
          { label: "Box", value: box?.name || "", emoji: box?.img || "" },
          { label: "Item", value: item?.name || "", emoji: "🌟" },
          { label: "Rerolls", value: rerollCount.toString(), emoji: "🔄" },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom:
                i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            <span
              style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}
            >
              {row.label}
            </span>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
              {row.emoji} {row.value}
            </span>
          </div>
        ))}
        {item?.imageUrl && (
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <img
              src={item.imageUrl}
              alt={item.name}
              style={{
                width: 64,
                height: 64,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            />
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
            paddingTop: 16,
            borderTop: `2px solid ${universe.color}33`,
          }}
        >
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>
            Total
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              background: universe.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ${totalSpent.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Shipping */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 20,
          padding: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 24,
          animation: "slideUp 0.5s ease 0.4s both",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 28 }}>📬</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
              Estimated Delivery
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              3-5 business days
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onStartOver}
        style={{
          width: "100%",
          padding: "16px 24px",
          background:
            "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 50%, #6BCB77 100%)",
          backgroundSize: "200% 200%",
          animation: "bgPan 4s ease infinite, slideUp 0.5s ease 0.5s both",
          border: "none",
          borderRadius: 16,
          fontSize: 16,
          fontWeight: 700,
          color: "#000",
          fontFamily: "'Fredoka', sans-serif",
          cursor: "pointer",
        }}
      >
        🎁 Open Another Mystery Box!
      </button>
    </div>
  );
}
