"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { GameResultDTO } from "@/models/GameResult";

interface GameResultViewProps {
  result: GameResultDTO;
}

const GameResultView: React.FC<GameResultViewProps> = ({ result }) => {
  const router = useRouter();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        padding: "2rem",
        boxSizing: "border-box",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: "#222",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "1rem", color: "#B8860B" }}>Game Over</h1>
        <p>Your outcome: <strong>{result.outcome}</strong></p>
        <p>Your Total Score: <strong>{result.myTotal}</strong></p>
        <p>Opponent’s Total Score: <strong>{result.otherTotal}</strong></p>

        <h2 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
          Your Breakdown
        </h2>
        <p>Carte: {result.myCarteResult}</p>
        <p>Denari: {result.myDenariResult}</p>
        <p>Primiera: {result.myPrimieraResult}</p>
        <p>Settebello: {result.mySettebelloResult}</p>
        <p>Scopa: {result.myScopaResult}</p>

        <h2 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
          Opponent Breakdown
        </h2>
        <p>Carte: {result.otherCarteResult}</p>
        <p>Denari: {result.otherDenariResult}</p>
        <p>Primiera: {result.otherPrimieraResult}</p>
        <p>Settebello: {result.otherSettebelloResult}</p>
        <p>Scopa: {result.otherScopaResult}</p>

        <button
          onClick={() => router.push("/home")}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#3E5F3A",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            fontSize: "1rem",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default GameResultView;

