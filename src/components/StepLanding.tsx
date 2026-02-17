"use client";

export default function StepLanding({ onBuy }: { onBuy: () => void }) {
  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 32, marginTop: 20 }}>
        <div
          style={{
            fontSize: 80,
            marginBottom: 12,
            animation: "float 4s ease-in-out infinite",
            filter: "drop-shadow(0 10px 30px rgba(255,107,107,0.3))",
          }}
        >
          🎁
        </div>
        <h1
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: 40,
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 8px",
            lineHeight: 1.1,
          }}
        >
          Double the
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77, #4ECDC4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% 200%",
              animation: "bgPan 4s ease infinite",
            }}
          >
            Mystery
          </span>
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 17,
            margin: 0,
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          Pick a fandom. Get a mystery box.
          <br />
          Open it for a mystery item.
        </p>
      </div>

      {/* How it works */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 20,
          padding: "20px",
          border: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          HOW IT WORKS
        </div>
        {[
          {
            emoji: "🎯",
            text: "Pick your fandom",
            sub: "Pokémon, One Piece, JJK, or Gundam",
          },
          {
            emoji: "📦",
            text: "Mystery box reveal",
            sub: "Don't like it? Reroll for $2",
          },
          {
            emoji: "🎉",
            text: "Open the box!",
            sub: "Another surprise inside — reroll available",
          },
          {
            emoji: "🚀",
            text: "Ship it!",
            sub: "Your mystery loot is on the way",
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 0",
              borderBottom:
                i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {item.emoji}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
                {item.text}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                {item.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onBuy}
        style={{
          width: "100%",
          padding: "20px 24px",
          background:
            "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 50%, #6BCB77 100%)",
          backgroundSize: "200% 200%",
          animation: "bgPan 4s ease infinite, pulseScale 2s ease-in-out infinite",
          border: "none",
          borderRadius: 18,
          fontSize: 20,
          fontWeight: 700,
          color: "#000",
          fontFamily: "'Fredoka', sans-serif",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(255,107,107,0.3)",
          letterSpacing: "0.5px",
        }}
      >
        🎁 Start for $13.00
      </button>
      <div
        style={{
          textAlign: "center",
          marginTop: 10,
          fontSize: 13,
          color: "rgba(255,255,255,0.3)",
        }}
      >
        Rerolls available for $2 each
      </div>
    </div>
  );
}
