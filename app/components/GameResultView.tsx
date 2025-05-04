"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { GameResultDTO } from "@/models/GameResult";
import { Button } from "antd";

interface GameResultViewProps {
  result: GameResultDTO;
}

const GameResultView: React.FC<GameResultViewProps> = ({ result }) => {
  const router = useRouter();

  return (
    <div className="result-container">
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
       
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        boxSizing: "border-box",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: "#222", //box
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "100%",
       
        }}
      >
        <h1 style={{ marginBottom: "1rem", color: "#B8860B" }}>
          Game Over
        </h1>

        <p style={{ margin: "4px 0" }}>
          Your outcome: <strong>{result.outcome}</strong>
        </p>
        <p style={{ margin: "4px 0" }}>
          Your Total Score: <strong>{result.myTotal}</strong>
        </p>
        <p style={{ margin: "4px 0 1.5rem" }}>
          Opponent’s Total Score: <strong>{result.otherTotal}</strong>
        </p>

        {/* ← here’s flex container for the two breakdowns → */}
        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            gap:            "1rem",
            marginBottom:   "1.5rem",
          }}
        >
          {/* Your breakdown on the left */}
          <div style={{ flex: 1, textAlign: "left" }}>
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
              Your Breakdown
            </h2>
            <p style={{ margin: "2px 0" }}>Carte: {result.myCarteResult}</p>
            <p style={{ margin: "2px 0" }}>Denari: {result.myDenariResult}</p>
            <p style={{ margin: "2px 0" }}>Primiera: {result.myPrimieraResult}</p>
            <p style={{ margin: "2px 0" }}>Settebello: {result.mySettebelloResult}</p>
            <p style={{ margin: "2px 0" }}>Scopa: {result.myScopaResult}</p>
          </div>

          {/* Opponent breakdown on the right */}
          <div style={{ flex: 1, textAlign: "right" }}>
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
              Opponent Breakdown
            </h2>
            <p style={{ margin: "2px 0" }}>Carte: {result.otherCarteResult}</p>
            <p style={{ margin: "2px 0" }}>Denari: {result.otherDenariResult}</p>
            <p style={{ margin: "2px 0" }}>Primiera: {result.otherPrimieraResult}</p>
            <p style={{ margin: "2px 0" }}>Settebello: {result.otherSettebelloResult}</p>
            <p style={{ margin: "2px 0" }}>Scopa: {result.otherScopaResult}</p>
          </div>
        </div>

        <Button
          onClick={() => router.push("/home")}
          
        >
          Return to Home
        </Button>
      </div>
    </div>
    </div>
  );
};
export default GameResultView;

