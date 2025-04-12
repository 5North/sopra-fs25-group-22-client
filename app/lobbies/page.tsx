"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { createLobby } from "@/api/registerService";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Client, IMessage } from "@stomp/stompjs";
import { getWsDomain } from "@/utils/domain";

interface Player {
  username: string;
}

interface Lobby {
  lobbyId: string | number;
  PIN: string | number;
  players: Player[]
  roomName?: string | "";
}

const LobbyPage: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  const { value: token } = useLocalStorage<string>("token", "");
  const { value: username } = useLocalStorage<string>("username", ""); 


  useEffect(() => {
    const autoCreateLobby = async () => {
      setError("");

      if (!token) {
        setError("User not authenticated. Please log in.");
        return;
      }

      try {
        const response = await createLobby(token, {}); 
        
        if (!response.ok) {
          if (response.status === 400) {
            setError("Invalid input or missing data.");
          } else {
            setError("Failed to create lobby. Please try again.");
          }
          return;
        }
        const data = await response.json();
        console.log(data)
        setLobby({ ...data, players: data.players ?? [] });

      } catch (err) {
        setError("An error occurred while creating the lobby.");
        console.error("Lobby creation error:", err);
      }
    };

    autoCreateLobby();
  }, [token]);

  useEffect(() => {
    if (!lobby) return;
    
      const client = new Client({
        brokerURL: getWsDomain() + `/lobby?token=${token}`,
        reconnectDelay: 2000,
        onConnect: () => {
          console.log("Connected to STOMP");

          client.subscribe(`/topic/lobby/${lobby.lobbyId}`, (message: IMessage) => {
            const data = JSON.parse(message.body);
            console.log("Received lobby update:", data);

            // TODO: Each time received an update add the user 
            if (data.status === "subscribed") {
                setLobby((prevLobby) => {
                  if (!prevLobby) return prevLobby;
            
                  // Avoid adding duplicate players
                  const alreadyJoined = prevLobby.players.some(
                    (p) => p.username === data.username
                  );
                  if (alreadyJoined) return prevLobby;
            
                  return {
                    ...prevLobby,
                    players: [...prevLobby.players, { username: data.username }],
                  };
                });
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
    
  }, [lobby, token]);

  const handleBack = () => {
    router.push("/home");
  };

  const handleStartGame = () => {
    if (!lobby) return; 

    stompClientRef.current?.publish({
      destination: `/app/start/${lobby.lobbyId}`,
      body: JSON.stringify({ command: "start" }),
    });
  
    router.push(`/game/${lobby.lobbyId}`);
  };
  

  if (error) {
    return (
      <div className="register-container">
        <div className="auth-wrapper">
          <h1 style={{ color: "#fff" }}>Error</h1>
          <p style={{ color: "red" }}>{error}</p>
          <Button onClick={handleBack}>Back</Button>
        </div>
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="register-container">
        <div className="auth-wrapper">
          <h1 style={{ color: "#fff" }}>Creating Lobby...</h1>
        </div>
      </div>
    );
  }

//DEBUG
  console.log("Local username:", username);
  console.log("Lobby players:", lobby.players);


  return (
    <div className="register-container">
      <div>
        <h1 style={{ marginBottom: "1rem", opacity: 0.8 }}>♠️ ♥️ ♦️ ♣️ </h1>
        <h2 style={{ margin: "1rem 0" }}>
          Game ID: {lobby.PIN ?? lobby.lobbyId} 🔗
        </h2>
        <h1 style={{ marginBottom: "1rem", opacity: 0.8 }}>♠️ ♥️ ♦️ ♣️ </h1>
      </div>

      <div className="team-wrapper">
        <div className="team-box">
            <h3> Team 1 </h3>
            {Array.isArray(lobby.players) && lobby.players
            .filter((_, i) => i % 2 === 0)
            .map((player, idx) => (
                <p key={`t1-${idx}`}>
                {player.username}
                joined
                </p>
            ))}
        </div>
        <div className="team-box">
            <h3> Team 2 </h3>
            {Array.isArray(lobby.players) && lobby.players
            .filter((_, i) => i % 2 === 1)
            .map((player, idx) => (
                <p key={`t2-${idx}`}>
                {player.username}
                joined
                </p>
            ))}
        </div>
        </div>

      <h2 style={{ marginBottom: "6rem" }}>🏁</h2>
      {lobby.players && lobby.players.length === 4 && 
      lobby.players.some((p) => p.username === username) && (
        <Button
            type="primary"
            className="custom-button"
            onClick={handleStartGame}
        >
            ♣️Start Game
        </Button>
        )}
    </div>
  );
};

export default LobbyPage;
