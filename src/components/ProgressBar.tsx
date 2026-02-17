"use client";

const STEPS = ["select", "genre", "reveal_box", "reveal_item", "checkout"];
const LABELS = ["Buy", "Pick", "Box", "Item", "Ship"];

export default function ProgressBar({
  currentStep,
  color,
  gradient,
}: {
  currentStep: string;
  color: string;
  gradient: string;
}) {
  const stepIndex = STEPS.indexOf(currentStep);

  return (
    <div style={{ padding: "12px 20px 0", position: "relative", zIndex: 10 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {LABELS.map((label, i) => {
          const isActive = i <= stepIndex;
          return (
            <div key={label} style={{ flex: 1 }}>
              <div
                style={{
                  height: 4,
                  borderRadius: 4,
                  background: isActive ? gradient : "rgba(255,255,255,0.08)",
                  transition: "all 0.5s ease",
                }}
              />
              <div
                style={{
                  fontSize: 9,
                  textAlign: "center",
                  marginTop: 4,
                  color: isActive ? color : "rgba(255,255,255,0.25)",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
