"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Client, IMessage } from "@stomp/stompjs";
import ScopaGameView from "@/components/ScopaGameView";
import GameResultView from "@/components/GameResultView";
import { GameSessionState, Card } from "@/models/GameSession"; 
import { GameResultDTO } from "@/models/GameResult";
import { getWsDomain } from "@/utils/domain";
import useLocalStorage from "@/hooks/useLocalStorage";


// simple initial state for loading before receiving real updates.
const initialGameState: GameSessionState = {
  gameId: 0,          // 
  tableCards: [],      
  players: [],         
  currentPlayerId: 0,  
};

interface MoveAnimationData {
    playerId: number;
    playedCard: Card;
    capturedCards: Card[];
  }

export default function GamePage() {
  const { id } = useParams(); 
  //const router = useRouter();
  const [gameState, setGameState] = useState<GameSessionState>(initialGameState);
  const [error, setError] = useState<string | null>(null);
  const [captureOptions, setCaptureOptions] = useState<Card[][]>([]);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [moveAnimation, setMoveAnimation] = useState<MoveAnimationData | null>(null);
  const [gameResult, setGameResult] = useState<GameResultDTO | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const { value: token } = useLocalStorage<string>("token", "");
  

  const getCurrentUserId = (): number | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.id;
        } catch (err) {
          console.error("Error parsing user info:", err);
        }
      }
    }
    return null;
  };

  const currentUserId = getCurrentUserId() || 0;

  // Basic setup for STOMP client connection on the game topic.
  useEffect(() => {
    if (!id) {
      setError("No game ID specified");
      return;
    }
    // Create STOMP client
    const client = new Client({
      brokerURL: getWsDomain() + `/lobby?token=${token}`, 
      reconnectDelay: 2000,
      onConnect: () => {
        console.log("Connected to game WebSocket");

        // Subscribe to public game state updates
        client.subscribe(`/topic/game/${id}`, (message: IMessage) => {
          try {
            const data: GameSessionState = JSON.parse(message.body);
            console.log("Public game state update:", data);
            setGameState({
                ...gameState,
                gameId: parseInt(id as string, 10),
                tableCards: data.tableCards, 
                players: data.players,
                currentPlayerId: data.currentPlayerId,
              });
          } catch (err) {
            console.error("Error processing game state update", err);
          }
        });

        // Private subscription for messages such as capture options or hand updates.
        client.subscribe("/user/queue/reply", (message: IMessage) => {
            try {
              const payload = JSON.parse(message.body);
              console.log("Private message received:", payload);
  
              // Check if payload is a capture options message.
              if (Array.isArray(payload) && payload.length > 0 && Array.isArray(payload[0])) {
                setCaptureOptions(payload);
                console.log("Capture options updated:", payload);

              }
              if (payload.userId === currentUserId && payload.handCards) {
                setMyHand(payload.handCards);
                console.log("My hand updated:", payload.handCards);
              }
              // handle other types of private messages here.
            } catch (err) {
              console.error("Error processing private message:", err);
            }
          });

        // Subscription for move broadcasts
          client.subscribe(`/topic/move/${id}`, (message: IMessage) => {
            try {
              const moveData: MoveAnimationData = JSON.parse(message.body);
              console.log("Received move broadcast:", moveData);
              // Set the move animation state to trigger display in the UI.
              setMoveAnimation(moveData);
              setTimeout(() => {
                setMoveAnimation(null);
              }, 3000);
            } catch (err) {
              console.error("Error processing move broadcast:", err);
            }
          });

          // Subscription for game result broadcast
          client.subscribe(`/topic/gameresult/${id}`, (message: IMessage) => {
            try {
              const resultData: GameResultDTO = JSON.parse(message.body);
              console.log("Received game result:", resultData);
              setGameResult(resultData);
            } catch (err) {
              console.error("Error processing game result:", err);
            }
          });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
        setError("WebSocket connection error.");
      },
    });

    stompClientRef.current = client;
    client.activate();

    // Clean up on unmount.
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [id, gameState, token, currentUserId]);

  //  Handler for playing a card (without capture options)
  const handleCardClick = (card: Card) => {
    if (!id) return;
    // payload for a card play without capture options
    const payload = JSON.stringify({
      "gameId/lobbyID": id,
      card: {
        suit: card.suit,
        value: card.value,
      },
    });
    console.log("Publishing played card payload:", payload);
    // Publish the payload to the backend endpoint
    stompClientRef.current?.publish({
      destination: `/app/playCard`,
      body: payload,
    });
  };

    // Handler for when a capture option is selected.
  const handleCaptureOptionClick = (chosenOption: Card[]) => {
    if (!id) return;
    // Clear capture options from UI as a user selection is made.
    setCaptureOptions([]);
    const payload = JSON.stringify({
      gameId: id,
      chosenOption: chosenOption,
    });
    console.log("Publishing capture option payload:", payload);
    stompClientRef.current?.publish({
      destination: `/app/chooseCapture`,
      body: payload,
    });
  };

  // Renders the capture options UI.
  const renderCaptureOptions = () => {
    if (captureOptions.length === 0) return null;
    return (
      <div style={{ backgroundColor: "rgba(0,0,0,0.8)", padding: "1rem", position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", borderRadius: "8px" }}>
        <h3 style={{ color: "#fff" }}>Choose your capture option:</h3>
        {captureOptions.map((option, idx) => (
          <div key={idx}
              style={{ display: "flex", cursor: "pointer", marginBottom: "0.5rem", border: "1px solid #fff", padding: "0.5rem" }}
              onClick={() => handleCaptureOptionClick(option)}>
            {option.map((card, cardIdx) => (
              <div key={cardIdx} style={{ margin: "0 0.5rem", color: "#fff" }}>
                {card.value} {card.suit}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };


  const renderMoveAnimation = () => {
    if (!moveAnimation) return null;
    return (
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: "1rem",
        borderRadius: "8px",
        color: "#fff",
        zIndex: 1000,
      }}>
        <h3>Move Animation</h3>
        <p>Player {moveAnimation.playerId} played:</p>
        <div style={{ marginBottom: "0.5rem" }}>
          {moveAnimation.playedCard.value} {moveAnimation.playedCard.suit}
        </div>
        {moveAnimation.capturedCards.length > 0 && (
          <>
            <p>and captured:</p>
            <div style={{ display: "flex" }}>
              {moveAnimation.capturedCards.map((card, idx) => (
                <div key={idx} style={{ marginRight: "4px" }}>
                  {card.value} {card.suit}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div style={{ color: "#fff", textAlign: "center", padding: "2rem" }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      {/* Render game view with the current state and card click handler */}
      {renderCaptureOptions()}
      {renderMoveAnimation()}
      <ScopaGameView
        gameSession={gameState}
        currentUserId={currentUserId} 
        myHand={myHand}
        onCardClick={handleCardClick}
      />
      {gameResult && <GameResultView result={gameResult} />}
    </div>
  );
}

