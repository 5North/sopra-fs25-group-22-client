"use client";

import React from "react";
import CardComponent from "./CardComponent";
import CardBackComponent from "./CardBackComponent";
import { GameSessionState, Card, Player, UserListElement } from "@/models/GameSession";

interface ScopaGameViewProps {
  gameSession: GameSessionState;
  currentUserId: number;
  myHand: Card[];
  usersList: UserListElement[];
  onCardClick: (card: Card) => void;
}

const ScopaGameView: React.FC<ScopaGameViewProps> = ({
  gameSession,
  currentUserId,
  myHand,
  usersList,
  onCardClick,
}) => {
  // All opponents
  console.log("game session in scopa view: ", gameSession);
  let opponents:Player[] = [];
  // let currentPlayer: Player[] = [];
  
if (gameSession.players) {
  console.log("🔹 All player IDs:", gameSession.players.map(p => p.userId));
  // Hack:  current user id is always 0 due to a previous issue. this is a hacky soltion to set current user id to the actual id current user has (and not 0)
  opponents = gameSession.players.filter((p) => p.userId !== currentUserId);
  console.log("🔸 Opponent IDs:", opponents.map(p => p.userId));
  // current player == players - opponents
  // currentPlayer = gameSession.players.filter((p) => p.userId === currentUserId);;
}

  
const getUsernameById = (id: number) => {
  const user = usersList.find(u => u.id === id);
  return user ? user.username : "Unknown";
};

// const isMyTurn = !opponents.some(p => p.userId === gameSession.currentPlayerId);


  return (
    <div className="game-board">
      {/* Render Opponents: for simplicity, assume up to three opponents placed at top, left and right. */}
      
      {/* Top Opponent */}
      <div className="opponent-area top-opponent">
        {opponents[0] && (
          <>
            <p>Opponent (ID: {opponents[0].userId}) {getUsernameById(opponents[0].userId)}</p>
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
            <p>Opponent (ID: {opponents[1].userId}) {getUsernameById(opponents[1].userId)}</p>
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
            <p>Opponent (ID: {opponents[2].userId}) {getUsernameById(opponents[2].userId)}</p>
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
  <h3>
    My Hand {currentUserId === gameSession.currentPlayerId ? '- My turn' : ''}
  </h3>
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      opacity: currentUserId === gameSession.currentPlayerId ? 1 : 0.5,
      pointerEvents: currentUserId === gameSession.currentPlayerId ? "auto" : "none",
    }}
  >
    {myHand.map((card, index) => (
      <div
        key={index}
        onClick={() => onCardClick(card)}
        style={{
          cursor: currentUserId === gameSession.currentPlayerId ? "pointer" : "default",
          marginRight: "4px",
        }}
      >
        <CardComponent card={card} />
      </div>
    ))}
  </div>
</div>

    </div>
  );
};

export default ScopaGameView;
