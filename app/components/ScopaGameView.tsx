"use client";

import React from "react";
import CardComponent from "./CardComponent";
import CardBackComponent from "./CardBackComponent";
import { GameSessionState, Card } from "@/models/GameSession";

interface ScopaGameViewProps {
  gameSession: GameSessionState;
  currentUserId: number;
  onCardClick: (card: Card) => void;
}

const ScopaGameView: React.FC<ScopaGameViewProps> = ({
  gameSession,
  currentUserId,
  onCardClick,
}) => {
  // Identify current user’s state.
  const myPlayerData = gameSession.players.find((p) => p.userId === currentUserId);
  // All opponents
  const opponents = gameSession.players.filter((p) => p.userId !== currentUserId);

  return (
    <div className="game-board">
      {/* Render Opponents: for simplicity, assume up to three opponents placed at top, left and right. */}
      
      {/* Top Opponent */}
      <div className="opponent-area top-opponent">
        {opponents[0] && (
          <>
            <p>Opponent (ID: {opponents[0].userId})</p>
            <div style={{ display: "flex" }}>
              {opponents[0].hand.map((_, idx) => (
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
              {opponents[1].hand.map((_, idx) => (
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
              {opponents[2].hand.map((_, idx) => (
                <CardBackComponent key={idx} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Center Table */}
      <div className="table-area">
        <h3>Table</h3>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {gameSession.table.cards.map((card, index) => (
            <CardComponent key={index} card={card} />
          ))}
        </div>
      </div>

      {/* Current User’s Hand */}
      <div className="my-hand-area">
        <h3>My Hand</h3>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {myPlayerData &&
            myPlayerData.hand.map((card, index) => (
              <CardComponent
                key={index}
                card={card}
                onClick={() => onCardClick(card)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ScopaGameView;
