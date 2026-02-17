"use client";

import { useState } from "react";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface PaymentModalProps {
  amount: number;
  label: string;
  gradient: string;
  color: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  paymentType: "entry" | "reroll";
  sessionId?: string;
}

export default function PaymentModal({
  amount,
  label,
  gradient,
  color,
  onSuccess,
  onCancel,
  paymentType,
  sessionId,
}: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent on server
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: paymentType, sessionId }),
      });

      const { clientSecret, paymentIntentId } = await res.json();

      if (!clientSecret) {
        throw new Error("Failed to create payment intent");
      }

      // Confirm payment with card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        onSuccess(paymentIntentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          background: "#1a1a2e",
          borderRadius: "24px 24px 0 0",
          padding: "28px 24px 40px",
          animation: "slideUp 0.4s ease",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.15)",
            margin: "0 auto 20px",
          }}
        />

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            PAYMENT
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "'Fredoka', sans-serif",
            }}
          >
            ${(amount / 100).toFixed(2)}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {label}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            CARD DETAILS
          </div>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "'Fredoka', 'Nunito', sans-serif",
                  "::placeholder": {
                    color: "rgba(255,255,255,0.3)",
                  },
                },
                invalid: {
                  color: "#e63946",
                },
              },
            }}
          />
        </div>

        {error && (
          <div
            style={{
              color: "#e63946",
              fontSize: 13,
              textAlign: "center",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isProcessing || !stripe}
          style={{
            width: "100%",
            padding: "18px 24px",
            background: isProcessing ? "rgba(255,255,255,0.1)" : gradient,
            border: "none",
            borderRadius: 16,
            fontSize: 16,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'Fredoka', sans-serif",
            cursor: isProcessing ? "not-allowed" : "pointer",
            boxShadow: isProcessing ? "none" : `0 6px 24px ${color}44`,
            opacity: isProcessing ? 0.7 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {isProcessing ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
        </button>

        <button
          onClick={onCancel}
          disabled={isProcessing}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "14px",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Fredoka', sans-serif",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
