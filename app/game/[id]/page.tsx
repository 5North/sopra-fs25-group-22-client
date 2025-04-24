"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Client, IMessage } from "@stomp/stompjs";
import ScopaGameView from "@/components/ScopaGameView";
import GameResultView from "@/components/GameResultView";
import { GameSessionState, Card, TablePrivateState, UserListElement } from "@/models/GameSession"; 
import { GameResultDTO } from "@/models/GameResult";
import { getWsDomain } from "@/utils/domain";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getUsers } from "@/api/registerService";
import CardComponent from "@/components/CardComponent";

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
  const hasPublishedRef = useRef(false);
  const { id } = useParams(); 
  //const router = useRouter();
  const [gameState, setGameState] = useState<GameSessionState>(initialGameState);
  const [error, setError] = useState<string | null>(null);
  const [captureOptions, setCaptureOptions] = useState<Card[][]>([]);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [moveAnimation, setMoveAnimation] = useState<MoveAnimationData | null>(null);
  const [gameResult, setGameResult] = useState<GameResultDTO | null>(null);
  const [allUsers, setAllUsers] = useState<UserListElement[]>([]);
  const stompClientRef = useRef<Client | null>(null);
  const { value: token } = useLocalStorage<string>("token", "");
  //const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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

  // Basic setup for STOMP client connection on the game topic.


useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await getUsers();
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
}, []);

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
         client.subscribe(`/topic/lobby/${id}`, (message: IMessage) => {
           try {
             const data: GameSessionState = JSON.parse(message.body);
             console.log("Public game state update:", data);
             setGameState(prev => ({
                ...prev,
                tableCards: data.tableCards,
                players:    data.players,
                currentPlayerId: data.currentPlayerId,
              }));
           } catch (err) {
             console.error("Error processing game state update", err);
           }
         });

        // subscription to private queue
        client.subscribe("/user/queue/reply", (message: IMessage) => {
            try {
              const payload = JSON.parse(message.body);
              console.log("Private message received:", payload);

              if(JSON.stringify(payload).includes("handCards")) {
                const data: TablePrivateState = JSON.parse(message.body);
                setMyHand(data.handCards);
              } else if (payload.tableCards) {
    console.log("🔔 initial public state (via queue):", payload);
    setGameState(prev => ({
      ...prev,
      tableCards:      payload.tableCards,
      players:         payload.players,
      currentPlayerId: payload.currentPlayerId,
    }));
              } else if(payload.outcome){
                const resultData: GameResultDTO = JSON.parse(message.body);
                console.log("Received game result:", resultData);
                setGameResult(resultData);
                //{"gameId":1567,"userId":9,"outcome":"LOST","myTotal":2,"otherTotal":3,"myCarteResult":1,"myDenariResult":1,"myPrimieraResult":0,"mySettebelloResult":0,"myScopaResult":0,"otherCarteResult":0,"otherDenariResult":0,"otherPrimieraResult":1,"otherSettebelloResult":1,"otherScopaResult":1}
                
              } else if (Array.isArray(payload) && payload.length > 0 && Array.isArray(payload[0])) {
                console.log("Received capture options:", payload);
                setCaptureOptions(payload); 
              } else {
                console.log("Unknown message from queue: " + JSON.stringify(payload))
              }
  
              // // Check if payload is a capture options message.
              // if (Array.isArray(payload) && payload.length > 0 && Array.isArray(payload[0])) {
              //   setCaptureOptions(payload);
              //   console.log("Capture options updated:", payload);

              // }
              // if (payload.userId === currentUserId && payload.handCards) {
              //   setMyHand(payload.handCards);
              //   console.log("My hand updated:", payload.handCards);
              // }
              // handle other types of private messages here.
            } catch (err) {
              console.error("Error processing private message:", err);
            }
          });

          if (!hasPublishedRef.current) { 
            console.log(`path is... /app/updateGame/${id}`);
            client.publish({
              destination: `/app/updateGame/${id}`,
              body: '',
              headers: {userId: `${currentUserId}`},
            });
            hasPublishedRef.current = true;
          }

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

        setMoveAnimation(null); 
        // // Subscription for move broadcasts
        //   client.subscribe(`/topic/move/${id}`, (message: IMessage) => {
        //     try {
        //       const moveData: MoveAnimationData = JSON.parse(message.body);
        //       console.log("Received move broadcast:", moveData);
        //       // Set the move animation state to trigger display in the UI.
        //       setMoveAnimation(moveData);
        //       setTimeout(() => {
        //         setMoveAnimation(null);
        //       }, 3000);
        //     } catch (err) {
        //       console.error("Error processing move broadcast:", err);
        //     }
        //   });
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
      <div style={{ backgroundColor: "rgba(0,0,0,0.8)", padding: "1rem", position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", borderRadius: "8px", zIndex: 999,color: "#fff"}}>
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
    <div style={{ backgroundColor: "blue", minHeight: "100vh"}}>
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
      {renderMoveAnimation()}
      <ScopaGameView
        gameSession={gameState}
        currentUserId={currentUserId || 0} 
        myHand={myHand}
        usersList={allUsers}
        onCardClick={handleCardClick}
      />
      {gameResult && <GameResultView result={gameResult} />}
      <div
        onClick={() => {
          const payload = JSON.stringify({ gameId: id});
          console.log("🔍 Sending AI suggestion request:", payload);
          stompClientRef.current?.publish({
            destination: `/app/ai`,
            body: payload,
          });
        }}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#f5ce42", 
          borderRadius: "50%",
          width: "120px",
          height: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          cursor: "pointer",
          zIndex: 1001,
        }}
        title="Get AI suggestion"
      >
  <img
    src="/images/aibot.png"
    alt="AI Suggestion"
    style={{
      width: "110",
      height: "110px",
      borderRadius: "50%",
      objectFit: "cover" // ensures the image fills the circle without distortion
    }}
  />
      </div>
    </div>
  );
}

