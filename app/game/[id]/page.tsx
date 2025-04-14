"use client";
  
import { useState, useEffect} from "react";
import { useParams } from "next/navigation";
// import { Client } from "@stomp/stompjs";     -------> removed for dummy purpose
// import useLocalStorage from "@/hooks/useLocalStorage";
// import { getWsDomain } from "@/utils/domain";
import ScopaGameView from "@/components/ScopaGameView";
import { GameSessionState, Card } from "@/models/GameSession";

export default function GamePage() {
  const { id } = useParams(); // capture game ID from URL
  // const { value: token } = useLocalStorage("token", "");    -------> removed for dummy purpose
  const [gameState, setGameState] = useState<GameSessionState | null>(null);
  // const stompClientRef = useRef<Client | null>(null);        -------> removed for dummy purpose

  // ============= DUMMY =======================================================================
  const dummyGameState: GameSessionState = {
    gameId: id ? id.toString() : "123",
    players: [
      {
        userId: 111,
        hand: [
          { suit: "DENARI", value: 7 },
          { suit: "COPPE", value: 5 },
          { suit: "SPADE", value: 3 },
        ],
        treasure: [],
        scopaCount: 0,
      },
      {
        userId: 222,
        hand: [
          { suit: "BASTONI", value: 2 },
          { suit: "DENARI", value: 9 },
          { suit: "COPPE", value: 1 },
        ],
        treasure: [],
        scopaCount: 0,
      },
      {
        userId: 333,
        hand: [
          { suit: "SPADE", value: 10 },
          { suit: "DENARI", value: 4 },
          { suit: "BASTONI", value: 6 },
        ],
        treasure: [],
        scopaCount: 0,
      },
      {
        userId: 444,
        hand: [
          { suit: "COPPE", value: 8 },
          { suit: "SPADE", value: 2 },
          { suit: "DENARI", value: 3 },
        ],
        treasure: [],
        scopaCount: 0,
      },
    ],
    table: {
      cards: [
        { suit: "BASTONI", value: 5 },
        { suit: "SPADE", value: 7 },
        { suit: "COPPE", value: 1 },
        { suit: "DENARI", value: 10 },
      ],
    },
    currentPlayerIndex: 0,
    lastGetterIndex: -1,
    turnCounter: 0,
  };


  // Immediately load the dummy data
  useEffect(() => {
    setGameState(dummyGameState);
    // to eventually connect to the WebSocket,  add  code here
    // for now skip so we can see the UI right away.
  });
  // ============= DUMMY =======================================================================

 /*

  // Establish WebSocket connection
  useEffect(() => {
    if (!id || !token) return;
    
    // Create and configure the STOMP client.
    const client = new Client({
      brokerURL: getWsDomain() + `/game?token=${token}`, 
      reconnectDelay: 2000,
      onConnect: () => {
        console.log("Connected to game WebSocket");

        // Subscribe to topic for receiving game state updates.
        client.subscribe(`/topic/game/${id}`, (message) => {
          try {
            const data: GameSessionState = JSON.parse(message.body);
            console.log("Game update received:", data);
            setGameState(data);
          } catch (error) {
            console.error("Error parsing game update:", error);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [id, token]);
  */

  // Event handler for when a player clicks a card.
  const handleCardClick = (card: Card) => {
    console.log("Card clicked:", card);
    const currentUser = { userId: 111 }; // -----------------------> DUmmy
    if (!gameState) return;

    // Identify which player is the current user (e.g., userId 111).
    const myPlayerIndex = gameState.players.findIndex(p => p.userId === currentUser.userId);
    if (myPlayerIndex === -1) return;

    // Create a copy of the existing game state so we can mutate it.
    const newGameState = structuredClone(gameState); // or deep copy manually

    // Remove the card from the user's hand.
    const myHand = newGameState.players[myPlayerIndex].hand;
    const cardIndex = myHand.findIndex(
        c => c.suit === card.suit && c.value === card.value
    );
    if (cardIndex !== -1) {
        myHand.splice(cardIndex, 1);
    }

    // For now, add this card to the table (simulate playing the card to the table).
    newGameState.table.cards.push(card);

    // change currentPlayerIndex to the next player.
    newGameState.currentPlayerIndex = (newGameState.currentPlayerIndex + 1) % newGameState.players.length;
    newGameState.turnCounter++;

    // Update the state.
    setGameState(newGameState);
    };
    // const payload = { -------------> removed for dummy version
    //  action: "PLAY_CARD",
    //  gameId: id,
    //  userId: currentUser.userId,
    //  card: card,
      // Optionally include 'selectedOption' for capture options.
    //};

    /*if (stompClientRef.current && stompClientRef.current.active) {
      stompClientRef.current.publish({
        destination: `/app/game/${id}`,
        body: JSON.stringify(payload),
      });
      console.log("Published PLAY_CARD payload:", payload);
    } else {
      console.error("WebSocket connection is not active");
    }
  };
  */

  // For testing: if gameState hasn't arrived, you might add a dummy state.
  if (!gameState) {
    return (
      <div style={{ color: "#fff", textAlign: "center", padding: "2rem" }}>
        Loading game...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      <ScopaGameView
        gameSession={gameState}
        currentUserId={111}  // ------------------------------------> for dummy purpose: currentUser.userId
        onCardClick={handleCardClick}
      />
    </div>
  );
}
