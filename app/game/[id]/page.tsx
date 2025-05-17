"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import ScopaGameView from "@/components/ScopaGameView";
import GameResultView from "@/components/GameResultView";
import { MoveAnimator } from "@/components/MoveAnimator";
import type { MoveAnimationData } from "@/components/MoveAnimator";
import {
  Card,
  GameSessionState,
  TablePrivateState,
  UserListElement,
} from "@/models/GameSession";
import { GameResultDTO } from "@/models/GameResult";
import { getWsDomain } from "@/utils/domain";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getUsers } from "@/api/registerService";
import CardComponent from "@/components/CardComponent";
import Image from "next/image";
import { Button } from "antd";

const initialGameState: GameSessionState = {
  gameId: 0, //
  tableCards: [],
  players: [],
  currentPlayerId: 0,
};

interface MoveState {
  playerId: number;
  pickedCards: Card[];
  playedCard: Card;
}

export default function GamePage() {
  const hasPublishedRef = useRef(false);
  const { id } = useParams();
  const [gameState, setGameState] = useState<GameSessionState>(
    initialGameState,
  );
  const [error, setError] = useState<string | null>(null);
  const [captureOptions, setCaptureOptions] = useState<Card[][]>([]);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [moveAnimation, setMoveAnimation] = useState<MoveAnimationData | null>(
    null,
  );
  const [gameResult, setGameResult] = useState<GameResultDTO | null>(null);
  const [allUsers, setAllUsers] = useState<UserListElement[]>([]);
  const stompClientRef = useRef<Client | null>(null);
  const { value: token } = useLocalStorage<string>("token", "");
  const [moveState, setMoveState] = useState<MoveState>();
  const [showRoundAnimation, setShowRoundAnimation] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [time, setTimer] = useState<number | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const prevEmptyRef = useRef<boolean>(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeatIndexRef = useRef<number | null>(null);
  const [finalCaptureMessage, setFinalCaptureMessage] = useState<string | null>(
    null,
  );
  const gameResultRef = useRef<GameResultDTO | null>(null);
  const finalCaptureShownRef = useRef(false);

  const router = useRouter();

  const getUserIdByUsername = (username: string): number | null => {
    const user = allUsers.find((u) => u.username === username);
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

  const getSeatIndexByUserId = (targetUserId: number): number => {
    const players = gameState?.players || [];
    const meIndex = players.findIndex((p) => p.userId === currentUserId);

    if (meIndex === -1) return -1;

    const seating = [...players.slice(meIndex), ...players.slice(0, meIndex)];
    const seatIndex = seating.findIndex((p) => p.userId === targetUserId);

    if (seatIndex !== -1) {
      lastSeatIndexRef.current = seatIndex;
    }

    return seatIndex;
  };

  useEffect(() => {
    // ensure we actually have an array
    if (!gameState?.tableCards) return;

    const isTableEmpty = gameState.tableCards.length === 0;
    const someoneHasCards = gameState.players?.some((p) => p.handSize > 0) ??
      false;

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
            if (
              payload.success !== undefined &&
              typeof payload.message === "string"
            ) {
              console.log("Lobby notification (ignored):", payload);
              return;
            } else if (payload.remainingSeconds) {
              console.log("⏱ Received timer:", payload.remainingSeconds);
              setTimer(payload.remainingSeconds);

              // Clear previous timer
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
              }

              // Start countdown
              timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => {
                  if (prev === null || prev <= 1) {
                    clearInterval(timerIntervalRef.current!);
                    return null;
                  }
                  return prev - 1;
                });
              }, 1000);
            }

            // Animatation
            if (payload.pickedCards) {
              const move: MoveState = payload;
              setMoveState(move);
            } // Update board
            else if (Array.isArray(payload.tableCards)) {
              const data: GameSessionState = payload;
              setGameState((prev) => ({
                ...prev,
                tableCards: data.tableCards,
                players: data.players,
                currentPlayerId: data.currentPlayerId,
              }));
              // } else if (payload.lobby) {
              //   console.log("rematchers: ", JSON.stringify(payload.lobby.rematchersIds))
              // }
            } else if (payload.userId && payload.cards) {
              const user = allUsers.find((u) => u.id === payload.userId);
              const username = user?.username || `User ${payload.userId}`;
              console.log("@@@@@@@@@@LAST CARDS MESSAGE", payload);
              setFinalCaptureMessage(`Last cards go to: ${username}`);
              finalCaptureShownRef.current = true;

              setTimeout(() => {
                setFinalCaptureMessage(null);
                finalCaptureShownRef.current = false;

                // If result already arrived, now show it
                if (gameResultRef.current) {
                  setGameResult(gameResultRef.current);
                  gameResultRef.current = null;
                }
              }, 3000);
            } else {
              console.log(
                "Lobby uncategorized message: ",
                JSON.stringify(payload),
              );
            }
          },
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
              setGameState((prev) => ({
                ...prev,
                tableCards: payload.tableCards,
                players: payload.players,
                currentPlayerId: payload.currentPlayerId,
              }));
            } else if (payload.outcome) {
              const resultData: GameResultDTO = JSON.parse(message.body);

              if (finalCaptureShownRef.current) {
                gameResultRef.current = resultData;
              } else {
                setGameResult(resultData);
              }
            } else if (
              Array.isArray(payload) && payload.length > 0 &&
              Array.isArray(payload[0])
            ) {
              console.log(
                ">>>>>>>>>>>><<<<<<<<<<<<<<<<<<Received capture options:",
                payload,
              );
              setCaptureOptions(payload);
            } else if (payload.suggestion) {
              setSuggestion(payload.suggestion);
            } else if (payload.remainingSeconds) {
              console.log("⏱ Received timer:", payload.remainingSeconds);

              setTimer(payload.remainingSeconds); // 1. Update time immediately

              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
              }

              timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => {
                  if (prev === null || prev <= 1) {
                    clearInterval(timerIntervalRef.current!);
                    return null;
                  }
                  return prev - 1;
                });
              }, 1000);
            } else if (payload.userId && payload.cards) {
              console.log("Received final capture for user", payload.userId);

              const user = allUsers.find((u) => u.id === payload.userId);
              const username = user?.username || `User ${payload.userId}`;

              setFinalCaptureMessage(`Last cards go to: ${username}`);

              // Hide the message after a delay
              setTimeout(() => {
                setFinalCaptureMessage(null);
              }, 3000);
            } else {
              console.log(
                "Unknown message from queue: " + JSON.stringify(payload),
              );
            }
          } catch (err) {
            console.error("Error processing private message:", err);
          }
        });

        if (!hasPublishedRef.current) {
          console.log(`path is... /app/updateGame/${id}`);
          client.publish({
            destination: `/app/updateGame/${id}`,
            body: "",
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
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [id, token, currentUserId]);

  //  Handler for playing a card (without capture options)
  const handleCardClick = (card: Card) => {
    setShowAIPanel(false);
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

  useEffect(() => {
    if (!gameState || !currentUserId) return;

    if (gameState.currentPlayerId !== currentUserId) {
      setCaptureOptions([]);
    }
  }, [gameState?.currentPlayerId, currentUserId]);

  useEffect(() => {
    if (time !== null && time <= 1 && showAIPanel) {
      setShowAIPanel(false);
    }
  }, [time, showAIPanel]);

  // Renders the capture options UI.
  const renderCaptureOptions = () => {
    console.log("-------render capture");
    if (captureOptions.length === 0) return null;
    return (
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: "1rem",
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          borderRadius: "8px",
          zIndex: 999,
          color: "#fff",
        }}
      >
        <h3 style={{ color: "#fff" }}>Choose your capture option:</h3>
        {captureOptions.map((option, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              cursor: "pointer",
              marginBottom: "0.5rem",
              border: "1px solid #fff",
              padding: "0.5rem",
            }}
            onClick={() => handleCaptureOptionClick(option)}
          >
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

    const seatIndex = getSeatIndexByUserId(moveState.playerId);

    setMoveAnimation({
      playerId: moveState.playerId,
      seatIndex: seatIndex as 0 | 1 | 2 | 3,
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

  const rematch = () => {
    if (!id) return;
    setCaptureOptions([]);
    const payload = JSON.stringify({
      gameId: id,
      userId: currentUserId,
      confirmRematch: true,
    });
    console.log("Publishing capture option payload:", payload);
    stompClientRef.current?.publish({
      destination: `/app/rematch`,
      body: payload,
    });
  };

  if (!token) {
    return (
      <div
        style={{
          backgroundImage: 'url("/images/background.jpg")', // Replace with your actual image path
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "2rem",
          color: "#fff",
        }}
      >
        <h2
          style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
            textShadow: "0 0 10px #000",
          }}
        >
          Unauthorized Access
        </h2>
        <p
          style={{
            fontSize: "1.2rem",
            marginBottom: "2rem",
            textShadow: "0 0 6px #000",
          }}
        >
          You must be logged in to access this game.
        </p>
        <Button
          type="primary"
          onClick={() => router.push("/login")}
          style={{
            backgroundColor: "#0ff",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontWeight: "bold",
            fontSize: "1rem",
            boxShadow:
              "0 0 8px rgba(0, 255, 255, 0.7), 0 0 16px rgba(0, 255, 255, 0.4)",
          }}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  if (gameResult) {
    return (
      <GameResultView
        result={gameResult}
        onReturnHome={unsubscribeFromGame}
        onRematch={rematch}
        gameId={Number(id)}
      />
    );
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
      {time !== null && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            backgroundColor: "#111",
            padding: "10px 20px",
            borderRadius: "12px",
            color: "#0ff",
            fontSize: "22px",
            fontFamily: "monospace",
            border: time <= 5 ? "2px solid #0ff" : "none",
            boxShadow: time <= 5
              ? "0 0 10px rgba(0, 255, 255, 0.7), 0 0 20px rgba(0, 255, 255, 0.4)"
              : "none",
            animation: time <= 5 ? "blink 1s step-start infinite" : "none",
            zIndex: 1200,
          }}
        >
          ⏳ {time}s
        </div>
      )}

      {/* Quit button */}
      <Button
        onClick={handleExit}
        style={{
          position: "absolute",
          bottom: "3.5rem",
          right: "5.5rem",
          borderRadius: "8px",
          zIndex: 999,
        }}
      >
        Quit Game
      </Button>

      {showRoundAnimation && (
        <>
          <div className="shuffle-overlay" />
          <div className="round-animation">
            <Image
              src="/images/scopa.png"
              alt="New Round"
              width={400}
              height={600}
              className="scopa-image"
              style={{ objectFit: "contain" }}
            />
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
      {finalCaptureMessage && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: "1.25rem 2rem",
            borderRadius: "12px",
            color: "#0ff",
            border: "2px solid #0ff",
            fontSize: "1.5rem",
            fontFamily: "monospace",
            boxShadow:
              "0 0 12px rgba(0,255,255,0.6), 0 0 24px rgba(0,255,255,0.3)",
            zIndex: 1300,
            animation: "fadeIn 0.5s ease-in-out",
          }}
        >
          {finalCaptureMessage}
        </div>
      )}
      {isMyTurn && renderCaptureOptions()}
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <MoveAnimator animation={moveAnimation} />
      </div>
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
            position: "absolute",
            borderRadius: "50%",
            objectFit: "cover",
            filter: isMyTurn ? "none" : "grayscale(100%)",
          }}
        />
      </div>

      {/* Suggestion Panel */}
      {showAIPanel && isMyTurn && (
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
            boxShadow:
              "0 0 8px rgb(133, 251, 255), 0 0 16px rgb(133, 251, 255)",
            zIndex: 1000,
          }}
        >
          {suggestion
            ? (
              <>
                <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  Suggested moves from the AI:
                </div>
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                  {suggestion
                    .split(";")
                    .map((line, idx) => (
                      <li key={idx} style={{ marginBottom: "6px" }}>
                        {line.trim()}
                      </li>
                    ))}
                </ul>
              </>
            )
            : (
              <div>
                <em>Waiting for suggestion...</em>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
