"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { GameResultDTO } from "@/models/GameResult";
import { Button } from "antd";

interface GameResultViewProps {
  result: GameResultDTO | { userId: number; outcome: string; message: string };
  onReturnHome: () => void;
}

const GameResultView: React.FC<GameResultViewProps> = ({ result, onReturnHome }) => {
  const router = useRouter();

  // type-guard for your full DTO
  const isFull = (r: any): r is GameResultDTO =>
    typeof r.myTotal !== "undefined" && typeof r.otherTotal !== "undefined";

  // helper list of categories
  const categories = [
    { key: "Carte",       my: (r: GameResultDTO) => r.myCarteResult,    other: (r: GameResultDTO) => r.otherCarteResult },
    { key: "Denari",      my: (r: GameResultDTO) => r.myDenariResult,   other: (r: GameResultDTO) => r.otherDenariResult },
    { key: "Primiera",    my: (r: GameResultDTO) => r.myPrimieraResult, other: (r: GameResultDTO) => r.otherPrimieraResult },
    { key: "Settebello",  my: (r: GameResultDTO) => r.mySettebelloResult, other:(r: GameResultDTO) => r.otherSettebelloResult },
    { key: "Scopa",       my: (r: GameResultDTO) => r.myScopaResult,     other:(r: GameResultDTO) => r.otherScopaResult },
  ];

  return (
    <div className="result-container">
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          zIndex: 2000,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "2rem",
            borderRadius: "8px",
            maxWidth: "480px",
            width: "100%",
          }}
        >
          {/* Header */}
          <h1
            style={{
              marginBottom: "0.5rem",
              color: "#FFAB40",
              textAlign: "center",
              textShadow:
                "0 0 4px #FFAB40, 0 0 8px #FFAB40, 0 0 16px rgba(255,171,64,0.5)",
            }}
          >
            Game Over
          </h1>

          {/* You Won / You Lost line */}
          <p
            style={{
              textAlign: "center",
              color: "#fff",
              fontSize: "1.25rem",
              fontWeight: "bold",
              margin: "0 0 1.5rem",
            }}
          >
            {isFull(result)
              ? result.outcome === "WON"
                ? "You Won"
                : result.outcome === "LOST"
                ? "You Lost"
                : `Result: ${result.outcome}`
              : `Result: ${result.outcome}`}
          </p>

          {isFull(result) ? (
            <>
              {/* Three-column breakdown grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: "0.5rem 1rem",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                {/* Column headers */}
                <div style={{ textAlign: "left", fontWeight: "bold", color: "#fff" }}>
                  Your Breakdown
                </div>
                <div /> {/* empty center header */}
                <div style={{ textAlign: "right", fontWeight: "bold", color: "#fff" }}>
                  Opponent Breakdown
                </div>

                {/* Rows */}
                {categories.map(({ key, my, other }) => {
                  const myVal = my(result)  ?? 0;
                  const opVal = other(result)  ?? 0;
                  return (
                    <React.Fragment key={key}>
                      <div
                        style={{
                          textAlign: "left",
                          fontWeight: myVal > opVal ? "6000" : "400",
                          color: "#fff",
                        }}
                      >
                        {myVal}
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          color: "#fff",
                        }}
                      >
                        {key}
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          fontWeight: opVal > myVal ? "6000" : "400",
                          color: "#fff",
                        }}
                      >
                        {opVal}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </>
          ) : (
            /* fallback for the simple {outcome, message} shape */
            <div style={{ marginBottom: "2rem", color: "#fff" }}>
              <p style={{ margin: "0.5rem 0" }}>Message: {result.message}</p>
            </div>
          )}

          {/* Return home */}
          <Button
            block
            onClick={() => {
              onReturnHome();
              router.push("/home");
            }}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameResultView;


