"use client";

import React from "react";
import { GameResultDTO } from "@/models/GameResult";

interface GameResultViewProps {
  result: GameResultDTO;
}

const GameResultView: React.FC<GameResultViewProps> = ({ result }) => {
  return (
    <div style={{ backgroundColor: "rgba(0,0,0,0.9)", color: "#fff", padding: "2rem", borderRadius: "8px", position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", zIndex: 1500 }}>
      <h2>Game Over</h2>
      <p>Your outcome: <strong>{result.outcome}</strong></p>
      <p>Your Total Score: {result.myTotal}</p>
      <p>Opponents Total Score: {result.otherTotal}</p>
      <h3>Your Breakdown</h3>
      <p>Carte Result: {result.myCarteResult}</p>
      <p>Denari Result: {result.myDenariResult}</p>
      <p>Primiera Result: {result.myPrimieraResult}</p>
      <p>Settebello Result: {result.mySettebelloResult}</p>
      <p>Scopa Result: {result.myScopaResult}</p>
      <h3>Opponent Breakdown</h3>
      <p>Carte Result: {result.otherCarteResult}</p>
      <p>Denari Result: {result.otherDenariResult}</p>
      <p>Primiera Result: {result.otherPrimieraResult}</p>
      <p>Settebello Result: {result.otherSettebelloResult}</p>
      <p>Scopa Result: {result.otherScopaResult}</p>
    </div>
  );
};

export default GameResultView;
