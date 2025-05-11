"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import ScopaGameView from "@/components/ScopaGameView";
import GameResultView from "@/components/GameResultView";
import { MoveAnimator } from "@/components/MoveAnimator";
import type { MoveAnimationData } from "@/components/MoveAnimator";
import { GameSessionState, Card, TablePrivateState, UserListElement } from "@/models/GameSession";
import { GameResultDTO } from "@/models/GameResult";
import { getWsDomain } from "@/utils/domain";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getUsers } from "@/api/registerService";
import CardComponent from "@/components/CardComponent";
import Image from "next/image";
import { Button } from "antd";



const initialGameState: GameSessionState = {
  gameId: 0,          // 
  tableCards: [],
  players: [],
  currentPlayerId: 0,
};

interface MoveState {
  playerId: number
  pickedCards: Card[],
  playedCard: Card
}

export default function GamePage() {
  const hasPublishedRef = useRef(false);
  const { id } = useParams();
  const [gameState, setGameState] = useState<GameSessionState>(initialGameState);
  const [error, setError] = useState<string | null>(null);
  const [captureOptions, setCaptureOptions] = useState<Card[][]>([]);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [moveAnimation, setMoveAnimation] = useState<MoveAnimationData | null>(null);
  const [gameResult, setGameResult] = useState<GameResultDTO | null>(null);
  const [allUsers, setAllUsers] = useState<UserListElement[]>([]);
  const stompClientRef = useRef<Client | null>(null);
  const { value: token } = useLocalStorage<string>("token", "");
  const [moveState, setMoveState] = useState<MoveState>();
  const [showRoundAnimation, setShowRoundAnimation] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const prevEmptyRef = useRef<boolean>(true);


  const getUserIdByUsername = (username: string): number | null => {
    const user = allUsers.find(u => u.username === username);
    return user ? user.id : null;
  };

  const getCurrentUserId = (): number | null => {
    if (typeof window !== "undefined") {
      const userName = localStorage.getItem("username");
      if (userName) {
        return getUserIdByUsername(userName);
      }
    }
    return null;
  };

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    // ensure we actually have an array
    if (!gameState?.tableCards) return;

    const isTableEmpty = gameState.tableCards.length === 0;
    const someoneHasCards =
      gameState.players?.some(p => p.handSize > 0) ?? false;

    if (!prevEmptyRef.current && isTableEmpty && someoneHasCards) {
      setShowRoundAnimation(true);
      setTimeout(() => setShowRoundAnimation(false), 2000);
    }
    prevEmptyRef.current = isTableEmpty;
  }, [gameState?.tableCards, gameState?.players]);
  


  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      try {
        const response = await getUsers(token);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const users: UserListElement[] = await response.json();
        console.log("Fetched users:", users);
        setAllUsers(users);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (!id) {
      setError("No game ID specified");
      return;
    }
    // Create STOMP client
    const client = new Client({
      brokerURL: getWsDomain() + `/lobby?token=${token}`,
      reconnectDelay: 2000,
      debug: (msg) => {
        console.log("[STOMP]", msg);
      },
      onConnect: () => {
        console.log("Connected to game WebSocket");

       // Subscribe to public game state updates
        subscriptionRef.current = client.subscribe(
          `/topic/lobby/${id}`,
          (message: IMessage) => {
            const payload = JSON.parse(message.body);

            // Ignore pure notification
            if (payload.success !== undefined && typeof payload.message === "string") {
              console.log("Lobby notification (ignored):", payload);
              return;
            }

            // Animatation
            if (payload.pickedCards) {
              const move: MoveState = payload;
              setMoveState(move);
            }
            // Update board
            else if (Array.isArray(payload.tableCards)) {
              const data: GameSessionState = payload;
              setGameState(prev => ({
                ...prev,
                tableCards:      data.tableCards,
                players:         data.players,
                currentPlayerId: data.currentPlayerId,
              }));
            }
          }
        );

        // subscription to private queue
        client.subscribe("/user/queue/reply", (message: IMessage) => {
          try {
            const payload = JSON.parse(message.body);
            console.log("Private message received:", payload);

            if (JSON.stringify(payload).includes("handCards")) {
              const data: TablePrivateState = JSON.parse(message.body);
              setMyHand(data.handCards);
            } else if (payload.tableCards) {
              console.log("🔔 initial public state (via queue):", payload);
              setGameState(prev => ({
                ...prev,
                tableCards: payload.tableCards,
                players: payload.players,
                currentPlayerId: payload.currentPlayerId,
              }));
            } else if (payload.outcome) {
              const resultData: GameResultDTO = JSON.parse(message.body);
              console.log("Received game result:", resultData);
              setTimeout(() => {
                setGameResult(resultData);
              }, 2500);
            } else if (Array.isArray(payload) && payload.length > 0 && Array.isArray(payload[0])) {
              console.log("Received capture options:", payload);
              setCaptureOptions(payload);
            } else if (payload.suggestion) {
              setSuggestion(payload.suggestion)
            } else {
              console.log("Unknown message from queue: " + JSON.stringify(payload))
            }

          } catch (err) {
            console.error("Error processing private message:", err);
          }
        });

        if (!hasPublishedRef.current) {
          console.log(`path is... /app/updateGame/${id}`);
          client.publish({
            destination: `/app/updateGame/${id}`,
            body: '',
            headers: { userId: `${currentUserId}` },
          });
          hasPublishedRef.current = true;
        }

        // Subscription for game result broadcast
        client.subscribe(`/topic/gameresult/${id}`, (message: IMessage) => {
          try {
            const resultData: GameResultDTO = JSON.parse(message.body);
            console.log("Received game result:", resultData);
            setTimeout(() => {
              setGameResult(resultData);
            }, 2500);
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
  }, [id, token, currentUserId]);

  //  Handler for playing a card (without capture options)
  const handleCardClick = (card: Card) => {
    setShowAIPanel(false)
    if (!id) return;
    // payload for a card play without capture options
    const payload = JSON.stringify({
      lobbyId: id,
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
    console.log("user id is: " + currentUserId);
  };

  // Handler for when a capture option is selected.
  const handleCaptureOptionClick = (chosenOption: Card[]) => {
    console.log("user id is in capture option: " + currentUserId);
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
    console.log("user id is in capture 2: " + currentUserId);
  };

  // Renders the capture options UI.
  const renderCaptureOptions = () => {
    console.log("render captur user id is: " + currentUserId);
    if (captureOptions.length === 0) return null;
    return (
      <div style={{ backgroundColor: "rgba(0,0,0,0.8)", padding: "1rem", position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", borderRadius: "8px", zIndex: 999, color: "#fff" }}>
        <h3 style={{ color: "#fff" }}>Choose your capture option:</h3>
        {captureOptions.map((option, idx) => (
          <div key={idx}
            style={{ display: "flex", cursor: "pointer", marginBottom: "0.5rem", border: "1px solid #fff", padding: "0.5rem" }}
            onClick={() => handleCaptureOptionClick(option)}>
            {option.map((card, cardIdx) => (
              <CardComponent card={card} key={cardIdx} />
            ))}
          </div>
        ))}
      </div>
    );
  };


  useEffect(() => {
    if (!moveState) return;
    const players = gameState?.players || [];

    const meIndex = players.findIndex(p => p.userId === currentUserId);
    const seating = meIndex >= 0
      ? [...players.slice(meIndex), ...players.slice(0, meIndex)]
      : players;

    const activeSeatIndex = seating.findIndex(
      p => p.userId === moveState.playerId
    );

    setMoveAnimation({
      playerId: moveState.playerId,
      seatIndex: activeSeatIndex as 0 | 1 | 2 | 3,
      playedCard: moveState?.playedCard || null,
      capturedCards: moveState?.pickedCards || [],
    });

    const timeout = setTimeout(() => {
      setMoveAnimation(null);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [moveState, currentUserId, gameState?.players]);



  if (error) {
    return (
      <div style={{ color: "#fff", textAlign: "center", padding: "2rem" }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  
  const unsubscribeFromGame = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      console.log(`Unsubscribed from /topic/lobby/${id}`);
      subscriptionRef.current = null;
    }
  };
  

  /*const rematch = () => {
    if (!id) return;
    setCaptureOptions([]);
    const payload = JSON.stringify({
      gameId: id,
      userId: currentUserId,
      confirmRematch: true
    });
    console.log("Publishing capture option payload:", payload);
    stompClientRef.current?.publish({
      destination: `/app/rematch`,
      body: payload,
    });
  }*/

  if (gameResult) {
    return <GameResultView result={gameResult} onReturnHome={unsubscribeFromGame} 
    //onRematch={rematch} 
    //gameId={Number(id)}
    />;
  }

  const isMyTurn = currentUserId === gameState?.currentPlayerId;

  const quitGame = () => {
    if (stompClientRef.current) {
      const payload = JSON.stringify({
        gameId: id,
        userId: currentUserId,
      });
      console.log("User quitting game:", payload);
      stompClientRef.current?.publish({
        destination: `/app/quitGame`,
        body: payload,
      });
    }
  };

  const handleExit = () => {
    console.log("User is quitting the game");
    quitGame();
  };
  
  return (
    <div style={{ backgroundColor: "blue", minHeight: "100vh" }}>
        {/* Quit button */}
        <Button
        onClick={handleExit}
        style={{
          position: "absolute",
          bottom: "3.5rem",
          right: "5.5rem",
          borderRadius: "8px",
          zIndex:999
        }}
      >
        Quit Game
        </Button>

       {showRoundAnimation && (
        <>
          <div className="shuffle-overlay" />
          <div className="round-animation">
            <Image src="/images/scopa.png" alt="New Round" width={400} height={600}
              className="scopa-image"
              style={{ objectFit: "contain" }} />
          </div>
        </>
      )} 
      {/* Render game view with the current state and card click handler */}
      {captureOptions.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 998,
          }}
        />
      )}
      {renderCaptureOptions()}
      <MoveAnimator
        animation={moveAnimation}
      />
      <ScopaGameView
        gameSession={gameState}
        currentUserId={currentUserId || 0}
        myHand={myHand}
        usersList={allUsers}
        onCardClick={handleCardClick}
      />
      {/* {gameResult && <GameResultView result={gameResult} onReturnHome={unsubscribeFromGame}/>} */}
      <div
        onClick={() => {
          if (!isMyTurn) return; // Prevent click if it's turn
          const payload = JSON.stringify({ gameId: id });
          console.log("🔍 Sending AI suggestion request:", payload);
          stompClientRef.current?.publish({
            destination: `/app/ai`,
            body: payload,
          });
          setShowAIPanel(true);
        }}
        className="neon-button"
        style={{
          position: "fixed",
          top: "6rem",
          right: "5rem",
          backgroundColor: isMyTurn ? "transparent" : "#333",
          borderRadius: "50%",
          width: "120px",
          height: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        
          boxShadow: isMyTurn
            ? "0 0 8px rgb(133, 251, 255), 0 0 16px #0ff"
            : "none",
          cursor: isMyTurn ? "pointer" : "not-allowed",
          border: isMyTurn ? "2px solid #0ff" : "2px solid #666",
          opacity: isMyTurn ? 1 : 0.4,
          zIndex: 1001,
        }}
        title={isMyTurn ? "Get AI suggestion" : "Wait for your turn"}
      >
        <Image
          src="/images/aibot.png"
          alt="AI Suggestion"
          width={120}
          height={120}
          style={{
            position:"absolute",
            borderRadius: "50%",
            objectFit: "cover",
            filter: isMyTurn ? "none" : "grayscale(100%)",
          }}
        />
      </div>

      {/* Suggestion Panel */}
      {showAIPanel && (
        <div
          style={{
            position: "fixed",
            top: "220px",
            right: "15px",
            width: "250px",
            padding: "12px",
            backgroundColor: "#000c",
            color: "#0ff",
            border: "2px solid #0ff",
            borderRadius: "12px",
            boxShadow: "0 0 8px rgb(133, 251, 255), 0 0 16px rgb(133, 251, 255)",
            zIndex: 1000,
          }}
        >
          {suggestion ? (
          suggestion.split(";").map((line, idx) => (
            <div key={idx}>{line.trim()}</div>
      ))
    ) : (
      <div><em>Waiting for suggestion...</em></div>
    )}
        </div>
      )}
    </div>

  );
}

