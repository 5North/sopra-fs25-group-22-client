"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { GameResultDTO } from "@/models/GameResult";
import { Button } from "antd";

interface GameResultViewProps {
  result: GameResultDTO | { userId: number; outcome: string; message: string };
  onReturnHome: () => void;
  onRematch: () => void;
  gameId: number;
}

const GameResultView: React.FC<GameResultViewProps> = ({ result, onReturnHome, onRematch, gameId }) => {
  const router = useRouter();

  const isGameCompleted = (result: GameResultDTO | { userId: number; outcome: string; message: string }): result is GameResultDTO => {
    return JSON.stringify(result).includes("myTotal") && JSON.stringify(result).includes("otherTotal");
  };

  return (
    <div className="result-container">
      <div
        style={{
          position: "relative",
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: "2rem",
            borderRadius: "8px",
            maxWidth: "400px",
            width: "100%",
            boxSizing: "content-box"
          }}
        >
          <h1 style={{ marginBottom: "1rem", color: "#FFAB40", textAlign: "center", textShadow: [
                    "0 0 4px #FFAB40",                // tight inner glow
                    "0 0 8px #FFAB40",                // mid-range bloom
                    "0 0 16px rgba(255,171,64,0.5)"   // softer outer haze
                  ].join(", ")}}
                  >Game Over
          </h1>

          {/* If it's the detailed result format */}
          {(isGameCompleted(result)) ? (
            <>
              <p style={{ margin: "4px 0" }}>
                Your outcome: <strong>{result.outcome}</strong>
              </p>
              <p style={{ margin: "4px 0" }}>
                Your Total Score: <strong>{result.myTotal}</strong>
              </p>
              <p style={{ margin: "4px 0 1.5rem" }}>
                Opponent’s Total Score: <strong>{result.otherTotal}</strong>
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                {/* Your breakdown on the left */}
                <div style={{ flex: 1, textAlign: "left" }}>
                  <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>Your Breakdown</h2>
                  <p style={{ margin: "2px 0" }}>Carte: {result.myCarteResult}</p>
                  <p style={{ margin: "2px 0" }}>Denari: {result.myDenariResult}</p>
                  <p style={{ margin: "2px 0" }}>Primiera: {result.myPrimieraResult}</p>
                  <p style={{ margin: "2px 0" }}>Settebello: {result.mySettebelloResult}</p>
                  <p style={{ margin: "2px 0" }}>Scopa: {result.myScopaResult}</p>
                </div>

                {/* Opponent breakdown on the right */}
                <div style={{ flex: 1, textAlign: "right" }}>
                  <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>Opponent Breakdown</h2>
                  <p style={{ margin: "2px 0" }}>Carte: {result.otherCarteResult}</p>
                  <p style={{ margin: "2px 0" }}>Denari: {result.otherDenariResult}</p>
                  <p style={{ margin: "2px 0" }}>Primiera: {result.otherPrimieraResult}</p>
                  <p style={{ margin: "2px 0" }}>Settebello: {result.otherSettebelloResult}</p>
                  <p style={{ margin: "2px 0" }}>Scopa: {result.otherScopaResult}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: "4px 0" }}>
                Outcome: <strong>{result.outcome}</strong>
              </p>
              <p style={{ margin: "4px 0" }}>
                Message: <strong>{result.message}</strong>
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
              </div>
            </>
          )}
  
        <div
        style={{
          display: "flex",
          justifyContent: isGameCompleted(result) ? "space-between" : "center",
          marginTop: "2rem",
        }}
      >
        <Button
          style={{ flex: 1, maxWidth: isGameCompleted(result) ? "45%" : "100%" }}
          onClick={() => {
            onReturnHome();
            router.push("/home");
          }}
        >
          Return to Home
        </Button>

        {isGameCompleted(result) && (
          <Button
            style={{ flex: 1, maxWidth: "45%" }}
            onClick={() => {
              onRematch();
              router.push(`/rematch/${gameId}`);
            }}
          >
            Rematch
          </Button>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};
export default GameResultView;

