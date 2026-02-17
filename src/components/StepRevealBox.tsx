"use client";

interface BoxData {
  id: string;
  name: string;
  img: string;
}

interface UniverseInfo {
  name: string;
  color: string;
  gradient: string;
}

export default function StepRevealBox({
  box,
  universe,
  isRevealing,
  onAccept,
  onReroll,
}: {
  box: BoxData | null;
  universe: UniverseInfo;
  isRevealing: boolean;
  onAccept: () => void;
  onReroll: () => void;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginBottom: 24, marginTop: 8 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          STEP 2 — {universe.name.toUpperCase()}
        </div>
        <h2
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: 26,
            fontWeight: 700,
            color: "#fff",
            margin: 0,
          }}
        >
          {isRevealing ? "Selecting your box..." : "Your Mystery Box!"}
        </h2>
      </div>

      {/* Box Visual */}
      <div
        style={{
          width: 200,
          height: 220,
          margin: "0 auto 32px",
          borderRadius: 24,
          background: isRevealing
            ? "rgba(255,255,255,0.06)"
            : `linear-gradient(160deg, ${universe.color}33 0%, ${universe.color}11 100%)`,
          border: `2px solid ${isRevealing ? "rgba(255,255,255,0.1)" : universe.color + "44"}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: isRevealing
            ? "shake 0.6s ease-in-out infinite"
            : "glowPulse 1.5s ease-in-out infinite",
          transition: "all 0.5s ease",
          position: "relative",
          overflow: "hidden",
          // @ts-expect-error CSS custom property
          "--glow-color": universe.color + "44",
        }}
      >
        {isRevealing ? (
          <>
            <div
              style={{
                fontSize: 60,
                animation: "pulseScale 0.5s ease-in-out infinite",
              }}
            >
              📦
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  animation: "pulseScale 1s ease-in-out infinite",
                  display: "inline-block",
                }}
              >
                Shuffling...
              </span>
            </div>
          </>
        ) : box ? (
          <>
            <div
              style={{
                fontSize: 60,
                animation: "bounceIn 0.6s ease both",
                filter: `drop-shadow(0 4px 20px ${universe.color}66)`,
              }}
            >
              {box.img}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                fontFamily: "'Fredoka', sans-serif",
                animation: "bounceIn 0.6s ease 0.2s both",
              }}
            >
              {box.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: universe.color,
                fontWeight: 600,
                marginTop: 4,
                animation: "bounceIn 0.6s ease 0.4s both",
              }}
            >
              {universe.name}
            </div>
          </>
        ) : null}
      </div>

      {/* Actions */}
      {!isRevealing && box && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            animation: "slideUp 0.5s ease 0.3s both",
          }}
        >
          <button
            onClick={onAccept}
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
              cursor: "pointer",
              boxShadow: `0 6px 24px ${universe.color}44`,
            }}
          >
            Open This Box!
          </button>
          <button
            onClick={onReroll}
            style={{
              width: "100%",
              padding: "14px 24px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              fontFamily: "'Fredoka', sans-serif",
              cursor: "pointer",
            }}
          >
            🔄 Different Box — $2.00
          </button>
        </div>
      )}
    </div>
  );
}
