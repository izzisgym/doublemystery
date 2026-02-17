"use client";

export default function Confetti({
  active,
  color,
}: {
  active: boolean;
  color: string;
}) {
  if (!active) return null;

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1.5,
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  const colors = [color, "#FFD700", "#FF6B6B", "#4ECDC4", "#FF69B4", "#00D2FF"];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-10%",
            width: p.size,
            height: p.size,
            background: colors[p.id % 6],
            borderRadius:
              p.id % 3 === 0 ? "50%" : p.id % 3 === 1 ? "2px" : "0",
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
