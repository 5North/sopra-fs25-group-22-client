"use client";

import React from "react";
import CardComponent from "./CardComponent";
import CardBackComponent from "./CardBackComponent";
import {
  Card,
  GameSessionState,
  Player,
  UserListElement,
} from "@/models/GameSession";

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
  const allPlayers = gameSession.players || [];
  const meIndex = allPlayers.findIndex((p) => p.userId === currentUserId);
  const seating = meIndex >= 0
    ? [...allPlayers.slice(meIndex), ...allPlayers.slice(0, meIndex)]
    : allPlayers;

  const opponents = [
    seating[2], // top = partner
    seating[1], // left = next
    seating[3], // right = last
  ].filter(Boolean) as Player[];

  // console.log("game session in scopa view: ", gameSession);

  // if (gameSession.players) {
  //   console.log("🔹 All player IDs:", gameSession.players.map(p => p.userId));
  //   console.log("🔸 Opponent IDs:", opponents.map(p => p.userId));
  // }

  const getUsernameById = (id: number) => {
    const user = usersList.find((u) => u.id === id);
    return user ? user.username : "Unknown";
  };

  const isActive = (playerId: number) =>
    playerId === gameSession.currentPlayerId;

  const TurnDot = () => (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        backgroundColor: "limegreen",
        border: "1px solid #32CD32",
        boxShadow: [
          "0 0 10px #32CD32",
          "0 0 15px #32CD32",
          "0 0 20px rgba(50,205,50,0.9)",
        ].join(", "),
        marginLeft: "6px",
      }}
    />
  );
  // const isMyTurn = !opponents.some(p => p.userId === gameSession.currentPlayerId);

  return (
    <div className="board-wrapper">
      <div
        className="game-board"
        style={{
          width: 886.32,
          height: 556.950005,
          paddingRight: 32,
          paddingBottom: 37.65,
        }}
      >
        {/* Top Opponent  */}
        <div className="opponent-area top-opponent">
          {opponents[0] && (
            <>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <h2
                  style={{ margin: 0, display: "flex", alignItems: "center" }}
                >
                  {getUsernameById(opponents[0].userId)}
                  {isActive(opponents[0].userId) && <TurnDot />}
                </h2>
                <p style={{ margin: 0 }}>🪙 {opponents[0].scopaCount}</p>
              </div>
              <div style={{ display: "flex" }}>
                {Array.from({ length: opponents[0].handSize }).map((_, idx) => (
                  <CardBackComponent key={idx} // for the top opponent, use blue-violet neon
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Left Opponent */}
        <div className="opponent-area left-opponent">
          {opponents[1] && (
            <>
              <div
                className="opponent-label"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <h2
                  style={{
                    margin: "-5px",
                    display: "flex",
                    alignItems: "center",
                    paddingTop: "10rem",
                    paddingRight: "5rem",
                  }}
                >
                  {getUsernameById(opponents[1].userId)}
                  {isActive(opponents[1].userId) && <TurnDot />}
                </h2>
                <p style={{ margin: "-5px", paddingRight: "4rem" }}>
                  🪙 {opponents[1].scopaCount}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {Array.from({ length: opponents[1].handSize }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{ transform: "rotate(90deg)", margin: "0px 0" }}
                  >
                    <CardBackComponent />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Opponent  */}
        <div className="opponent-area right-opponent">
          {opponents[2] && (
            <>
              <div
                className="opponent-label"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <h2
                  style={{
                    margin: "-5px",
                    display: "flex",
                    alignItems: "center",
                    paddingTop: "10rem",
                    paddingRight: "6rem",
                  }}
                >
                  {getUsernameById(opponents[2].userId)}
                  {isActive(opponents[2].userId) && <TurnDot />}
                </h2>
                <p style={{ margin: "-5px", paddingRight: "6rem" }}>
                  🪙 {opponents[2].scopaCount}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {Array.from({ length: opponents[2].handSize }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{ transform: "rotate(-90deg)", margin: "0px 0" }}
                  >
                    <CardBackComponent />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Center Table - Non-clickable */}
        {gameSession.tableCards && (
          <div className="table-area">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                pointerEvents: "none", // 🔒 disables clicks
              }}
            >
              {gameSession.tableCards.map((card, i) => (
                <CardComponent
                  key={i}
                  card={card}
                  borderColor="#FFAA00"
                  glowColor="rgba(255,170,0,0.8)"
                />
              ))}
            </div>
          </div>
        )}

        {/* Hand (bottom) */}
        <div className="my-hand-area">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              opacity: currentUserId === gameSession.currentPlayerId ? 1 : 0.5,
              pointerEvents: currentUserId === gameSession.currentPlayerId
                ? "auto"
                : "none",
            }}
          >
            {myHand.map((card, i) => (
              <div
                key={i}
                onClick={() => onCardClick(card)}
                style={{
                  cursor: currentUserId === gameSession.currentPlayerId
                    ? "pointer"
                    : "default",
                  marginRight: 2,
                }}
              >
                <CardComponent card={card} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2
              style={{ margin: "-4px", display: "flex", alignItems: "center" }}
            >
              {currentUserId === gameSession.currentPlayerId ? "My turn!" : ""}
              {currentUserId === gameSession.currentPlayerId && <TurnDot />}
            </h2>
            <p style={{ margin: 0 }}>
              🪙 {gameSession.players?.find((p) => p.userId === currentUserId)
                ?.scopaCount ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScopaGameView;
