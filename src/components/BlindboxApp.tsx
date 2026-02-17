"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Confetti from "./Confetti";
import ProgressBar from "./ProgressBar";
import PaymentModal from "./PaymentModal";
import StepLanding from "./StepLanding";
import StepGenre from "./StepGenre";
import StepRevealBox from "./StepRevealBox";
import StepRevealItem from "./StepRevealItem";
import StepCheckout from "./StepCheckout";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface UniverseData {
  slug: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  boxCount: number;
}

interface BoxData {
  id: string;
  name: string;
  img: string;
}

interface ItemData {
  id: string;
  name: string;
  imageUrl?: string | null;
}

interface UniverseInfo {
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  slug: string;
}

export default function BlindboxApp() {
  const [step, setStep] = useState("select");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [universes, setUniverses] = useState<UniverseData[]>([]);
  const [selectedUniverse, setSelectedUniverse] = useState<UniverseInfo | null>(
    null
  );
  const [selectedBox, setSelectedBox] = useState<BoxData | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [rerollCount, setRerollCount] = useState(0);
  const [slideIn, setSlideIn] = useState(false);

  // Payment modal state
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<
    "entry" | "reroll_box" | "reroll_item"
  >("entry");

  // Load universes on mount
  useEffect(() => {
    fetch("/api/universes")
      .then((r) => r.json())
      .then((data) => {
        if (data.universes) {
          setUniverses(
            data.universes.map(
              (u: {
                slug: string;
                name: string;
                emoji: string;
                color: string;
                gradient: string;
                boxes: unknown[];
              }) => ({
                slug: u.slug,
                name: u.name,
                emoji: u.emoji,
                color: u.color,
                gradient: u.gradient,
                boxCount: u.boxes.length,
              })
            )
          );
        }
      })
      .catch(console.error);
  }, []);

  // Slide-in animation on step change
  useEffect(() => {
    setSlideIn(true);
    const t = setTimeout(() => setSlideIn(false), 600);
    return () => clearTimeout(t);
  }, [step]);

  const triggerConfetti = (duration = 2500) => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), duration);
  };

  // --- Payment Handlers ---

  const handleBuy = () => {
    setPaymentType("entry");
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setShowPayment(false);

    if (paymentType === "entry") {
      // Create blindbox session
      try {
        const res = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId }),
        });
        const data = await res.json();
        setSessionId(data.sessionId);
        setTotalSpent(13);
        setStep("genre");
      } catch (err) {
        console.error("Error creating session:", err);
      }
    } else if (paymentType === "reroll_box") {
      setRerollCount((c) => c + 1);
      setTotalSpent((s) => s + 2);
      doRerollBox(paymentIntentId);
    } else if (paymentType === "reroll_item") {
      setRerollCount((c) => c + 1);
      setTotalSpent((s) => s + 2);
      doRerollItem(paymentIntentId);
    }
  };

  // --- Genre Selection ---

  const handleSelectGenre = async (slug: string) => {
    if (!sessionId) return;
    setStep("reveal_box");
    setIsRevealing(true);

    try {
      const res = await fetch("/api/reveal-box", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, universeSlug: slug }),
      });
      const data = await res.json();

      // Delay reveal for animation
      setTimeout(() => {
        setSelectedBox(data.box);
        setSelectedUniverse(data.universe);
        setIsRevealing(false);
        triggerConfetti();
      }, 2000);
    } catch (err) {
      console.error("Error revealing box:", err);
      setIsRevealing(false);
    }
  };

  // --- Box Actions ---

  const handleAcceptBox = async () => {
    if (!sessionId) return;
    setStep("reveal_item");
    setIsRevealing(true);

    try {
      const res = await fetch("/api/reveal-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();

      setTimeout(() => {
        setSelectedItem(data.item);
        setIsRevealing(false);
        triggerConfetti();
      }, 2200);
    } catch (err) {
      console.error("Error revealing item:", err);
      setIsRevealing(false);
    }
  };

  const handleRerollBox = () => {
    setPaymentType("reroll_box");
    setShowPayment(true);
  };

  const doRerollBox = async (paymentIntentId: string) => {
    if (!sessionId) return;
    setStep("reveal_box");
    setIsRevealing(true);

    try {
      const res = await fetch("/api/reroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          type: "box",
          paymentIntentId,
        }),
      });
      const data = await res.json();

      setTimeout(() => {
        setSelectedBox(data.box);
        if (data.universe) setSelectedUniverse(data.universe);
        setIsRevealing(false);
        triggerConfetti();
      }, 2000);
    } catch (err) {
      console.error("Error rerolling box:", err);
      setIsRevealing(false);
    }
  };

  // --- Item Actions ---

  const handleAcceptItem = () => {
    setStep("checkout");
    triggerConfetti(3000);
  };

  const handleRerollItem = () => {
    setPaymentType("reroll_item");
    setShowPayment(true);
  };

  const doRerollItem = async (paymentIntentId: string) => {
    if (!sessionId) return;
    setStep("reveal_item");
    setIsRevealing(true);

    try {
      const res = await fetch("/api/reroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          type: "item",
          paymentIntentId,
        }),
      });
      const data = await res.json();

      setTimeout(() => {
        setSelectedItem(data.item);
        setIsRevealing(false);
        triggerConfetti();
      }, 2200);
    } catch (err) {
      console.error("Error rerolling item:", err);
      setIsRevealing(false);
    }
  };

  // --- Start Over ---

  const handleStartOver = () => {
    setStep("select");
    setSessionId(null);
    setSelectedUniverse(null);
    setSelectedBox(null);
    setSelectedItem(null);
    setTotalSpent(0);
    setRerollCount(0);
    setIsRevealing(false);
    setShowConfetti(false);
  };

  // Theme colors
  const currentColor = selectedUniverse?.color || "#FF6B6B";
  const currentGradient =
    selectedUniverse?.gradient ||
    "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 50%, #6BCB77 100%)";

  const stripePaymentAmount =
    paymentType === "entry" ? 1300 : 200;
  const stripePaymentLabel =
    paymentType === "entry" ? "Double Mystery Entry" : "Reroll Fee";

  return (
    <Elements stripe={stripePromise}>
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0f",
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          position: "relative",
          overflow: "hidden",
          maxWidth: 430,
          margin: "0 auto",
        }}
      >
        {/* Animated BG pattern */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            opacity: 0.06,
            zIndex: 0,
            backgroundImage: `radial-gradient(circle at 20% 50%, ${currentColor} 1px, transparent 1px), radial-gradient(circle at 80% 20%, ${currentColor} 1px, transparent 1px)`,
            backgroundSize: "60px 60px, 80px 80px",
            animation: "bgPan 20s ease infinite",
          }}
        />

        <Confetti active={showConfetti} color={currentColor} />

        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "rgba(10,10,15,0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                fontSize: 28,
                animation: "float 3s ease-in-out infinite",
              }}
            >
              📦
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                  background: currentGradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                }}
              >
                DOUBLE MYSTERY
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Mystery Box Experience
              </div>
            </div>
          </div>
          {totalSpent > 0 && (
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 13,
                color: "#fff",
                fontWeight: 600,
              }}
            >
              ${totalSpent.toFixed(2)}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <ProgressBar
          currentStep={step}
          color={currentColor}
          gradient={currentGradient}
        />

        {/* Main Content */}
        <div
          style={{
            padding: "20px 20px 120px",
            position: "relative",
            zIndex: 10,
            animation: slideIn ? "slideUp 0.5s ease" : "none",
          }}
        >
          {step === "select" && <StepLanding onBuy={handleBuy} />}

          {step === "genre" && (
            <StepGenre universes={universes} onSelect={handleSelectGenre} />
          )}

          {step === "reveal_box" && selectedUniverse && (
            <StepRevealBox
              box={selectedBox}
              universe={selectedUniverse}
              isRevealing={isRevealing}
              onAccept={handleAcceptBox}
              onReroll={handleRerollBox}
            />
          )}

          {step === "reveal_item" && selectedUniverse && (
            <StepRevealItem
              item={selectedItem}
              box={selectedBox}
              universe={selectedUniverse}
              isRevealing={isRevealing}
              onAccept={handleAcceptItem}
              onReroll={handleRerollItem}
            />
          )}

          {step === "checkout" && selectedUniverse && sessionId && (
            <StepCheckout
              universe={selectedUniverse}
              box={selectedBox}
              item={selectedItem}
              rerollCount={rerollCount}
              totalSpent={totalSpent}
              sessionId={sessionId}
              onStartOver={handleStartOver}
            />
          )}
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <PaymentModal
            amount={stripePaymentAmount}
            label={stripePaymentLabel}
            gradient={currentGradient}
            color={currentColor}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPayment(false)}
            paymentType={paymentType === "entry" ? "entry" : "reroll"}
            sessionId={sessionId || undefined}
          />
        )}
      </div>
    </Elements>
  );
}
