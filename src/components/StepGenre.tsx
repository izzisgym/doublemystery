"use client";

interface UniverseData {
  slug: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  boxCount: number;
}

export default function StepGenre({
  universes,
  onSelect,
}: {
  universes: UniverseData[];
  onSelect: (slug: string) => void;
}) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24, marginTop: 8 }}>
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
          STEP 1
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
          Choose Your Fandom
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 16,
            margin: "8px 0 0",
          }}
        >
          Each fandom has mystery boxes waiting for you
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {universes.map((universe, idx) => (
          <button
            key={universe.slug}
            onClick={() => onSelect(universe.slug)}
            style={{
              width: "100%",
              padding: "22px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 16,
              animation: `slideUp 0.5s ease ${idx * 0.1}s both`,
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = universe.color + "66";
              e.currentTarget.style.background = `linear-gradient(135deg, ${universe.color}11 0%, ${universe.color}05 100%)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)";
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: universe.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
                boxShadow: `0 4px 20px ${universe.color}33`,
              }}
            >
              {universe.emoji}
            </div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 20,
                  fontFamily: "'Fredoka', sans-serif",
                }}
              >
                {universe.name}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 13,
                  marginTop: 3,
                }}
              >
                {universe.boxCount} mystery boxes available
              </div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 24 }}>
              →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
