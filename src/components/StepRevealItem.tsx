"use client";

interface ItemData {
  id: string;
  name: string;
  imageUrl?: string | null;
}

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

export default function StepRevealItem({
  item,
  box,
  universe,
  isRevealing,
  onAccept,
  onReroll,
}: {
  item: ItemData | null;
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
            fontSize: 15,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          STEP 3 — OPENING {box?.name.toUpperCase()}
        </div>
        <h2
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: 30,
            fontWeight: 700,
            color: "#fff",
            margin: 0,
          }}
        >
          {isRevealing ? "Opening your box..." : "You got..."}
        </h2>
      </div>

      {/* Item Reveal */}
      <div
        style={{
          width: 240,
          minHeight: 270,
          margin: "0 auto 32px",
          borderRadius: 24,
          background: isRevealing
            ? "rgba(255,255,255,0.04)"
            : `linear-gradient(160deg, ${universe.color}22 0%, rgba(255,255,255,0.04) 50%, ${universe.color}11 100%)`,
          border: `2px solid ${isRevealing ? "rgba(255,255,255,0.08)" : universe.color + "55"}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: isRevealing
            ? "shake 0.5s ease-in-out infinite"
            : "glowPulse 1.5s ease-in-out infinite",
          padding: 20,
          position: "relative",
          // @ts-expect-error CSS custom property
          "--glow-color": universe.color + "44",
        }}
      >
        {isRevealing ? (
          <>
            <div
              style={{
                fontSize: 60,
                animation: "spinReveal 1s ease-in-out infinite",
              }}
            >
              {box?.img}
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 14,
                color: "rgba(255,255,255,0.4)",
                fontWeight: 600,
              }}
            >
              Opening...
            </div>
          </>
        ) : item ? (
          <>
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{
                  width: 112,
                  height: 112,
                  objectFit: "cover",
                  borderRadius: 12,
                  marginBottom: 10,
                  animation: "bounceIn 0.6s ease both",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 48,
                  marginBottom: 4,
                  animation: "bounceIn 0.6s ease both",
                }}
              >
                🌟
              </div>
            )}
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#fff",
                fontFamily: "'Fredoka', sans-serif",
                animation: "bounceIn 0.6s ease 0.15s both",
                lineHeight: 1.3,
              }}
            >
              {item.name}
            </div>
            <div
              style={{
                marginTop: 8,
                padding: "4px 16px",
                borderRadius: 20,
                background: universe.gradient,
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                animation: "bounceIn 0.6s ease 0.3s both",
                letterSpacing: "0.5px",
              }}
            >
              {box?.name}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                animation: "bounceIn 0.6s ease 0.4s both",
              }}
            >
              {universe.name} Collection
            </div>
          </>
        ) : null}
      </div>

      {/* Actions */}
      {!isRevealing && item && (
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
              padding: "18px 24px",
              background: universe.gradient,
              border: "none",
              borderRadius: 16,
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "'Fredoka', sans-serif",
              cursor: "pointer",
              boxShadow: `0 6px 24px ${universe.color}44`,
            }}
          >
            🎉 I Love It — Ship It!
          </button>
          <button
            onClick={onReroll}
            style={{
              width: "100%",
              padding: "16px 24px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              fontSize: 15,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              fontFamily: "'Fredoka', sans-serif",
              cursor: "pointer",
            }}
          >
            🔄 Try Again — $2.00
          </button>
        </div>
      )}
    </div>
  );
}
