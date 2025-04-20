"use client";

import React from "react";
import CardComponent from "./CardComponent";
import CardBackComponent from "./CardBackComponent";
import { GameSessionState, Card, Player } from "@/models/GameSession";

interface ScopaGameViewProps {
  gameSession: GameSessionState;
  currentUserId: number;
  myHand: Card[];
  onCardClick: (card: Card) => void;
}

const ScopaGameView: React.FC<ScopaGameViewProps> = ({
  gameSession,
  currentUserId,
  myHand,
  onCardClick,
}) => {
  // All opponents
  console.log("game session in scopa view: ", gameSession);
  let opponents:Player[] = [];

if (gameSession.players) {
  opponents = gameSession.players.filter((p) => p.userId !== currentUserId);
}

  return (
    <div className="game-board">
      {/* Render Opponents: for simplicity, assume up to three opponents placed at top, left and right. */}
      
      {/* Top Opponent */}
      <div className="opponent-area top-opponent">
        {opponents[0] && (
          <>
            <p>Opponent (ID: {opponents[0].userId})</p>
            <div style={{ display: "flex" }}>
            {Array.from({ length: opponents[0].handSize }).map((_, idx) => (
                <CardBackComponent key={idx} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Left Opponent */}
      <div className="opponent-area left-opponent">
        {opponents[1] && (
          <>
            <p>Opponent (ID: {opponents[1].userId})</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
            {Array.from({ length: opponents[1].handSize }).map((_, idx) => (
                <CardBackComponent key={idx} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right Opponent */}
      <div className="opponent-area right-opponent">
        {opponents[2] && (
          <>
            <p>Opponent (ID: {opponents[2].userId})</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
            {Array.from({ length: opponents[2].handSize }).map((_, idx) => (
                <CardBackComponent key={idx} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Center Table */}
      {gameSession.tableCards && (
  <div className="table-area">
    <h3>Table</h3>
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {gameSession.tableCards.map((card, index) => (
        <CardComponent key={index} card={card} />
      ))}
    </div>
  </div>
)}

      {/* Current User’s Hand */}
      <div className="my-hand-area">
        <h3>My Hand</h3>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
        {myHand.map((card, index) => (
            <div key={index} style={{ marginRight: "4px" }}>
              {/* Here we show the actual card, clickable */}
              <div
                style={{
                  width: "40px",
                  height: "60px",
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={() => onCardClick(card)}
              >
                {card.value} {card.suit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScopaGameView;
