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
}

// Utility to get username from localStorage:
const getUsername = (): string => {
    if (typeof window === "undefined") return "";
    const stored = localStorage.getItem("username") || "";
    try {
      return JSON.parse(stored);
    } catch {
      return stored;
    }
  };


const LobbyPage: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  const { value: token } = useLocalStorage<string>("token", "");
  const username = getUsername();


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
        console.log("Lobby created:", data);

        // Build initialPlayers array; if players are missing, create an empty array
        const initialPlayers: Player[] = data.players && data.players.length > 0
          ? data.players
          : [];
        // Add the host if not already present
        if (!initialPlayers.some((player: Player) => player.username === username)) {
          initialPlayers.push({ username });
        }

        setLobby({ ...data, players: initialPlayers });

      } catch (err) {
        setError("An error occurred while creating the lobby.");
        console.error("Lobby creation error:", err);
      }
    };

    autoCreateLobby();
  }, [token, username]);

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
            if (data.status == "subscribed") {
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

    console.log("handle start game called..")
    if(!stompClientRef.current) {
      console.log("STOMP REF NOT EXISTING!!!");
    }

    stompClientRef.current?.publish({
      destination: `/app/startGame/${String(lobby.lobbyId)}`,
      body: '',
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
    <div
      className="register-container"
      style={{
        position: "relative", 
        color: "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        height: "100vh", 
      }}
    >
      {/* Game-ID Pill */}
      <h2
        style={{
          margin: "7rem 0 2rem",
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "#00e5ff",                // neon-blue
          border: "1px solid #00e5ff",
          boxShadow: "0 0 8px rgba(0,229,255,0.5)",
          fontWeight: "normal",
        }}
      >
        Game ID: {lobby.PIN ?? lobby.lobbyId} 🔗
      </h2>

      {/* Teams row */}
      <div
        className="team-wrapper"
        style={{
          display: "flex",
          gap: "2rem",
          width: "100%",
          maxWidth: "700px",
          marginBottom: "3rem",
        }}
      >
        {["Team 1", "Team 2"].map((label, teamIndex) => (
          <div
            key={label}
            className="team-box"
            style={{
              flex: "0 0 45%",
              maxWidth: "45%", 
              backgroundColor: "rgba(0,0,0,0.4)",    
              border: "1px solid #00e5ff",
              borderRadius: "0.5rem",
              padding: "0.5rem",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#00e5ff" }}>{label}</h3>
            {(lobby.players ?? [])
              .filter((_, i) => i % 2 === teamIndex)
              .map((p, i) => (
                <p key={i} style={{ margin: "0.5rem 0" }}>
                  {p.username} joined
                </p>
              ))}
          </div>
        ))}
      </div>

      {/* Start button */}
      {lobby.players?.length === 4 &&
        lobby.players.some((p) => p.username === username) && (
          <div>
          <Button
            type="primary"
            onClick={handleStartGame}
          >
            Start Game
          </Button>
          </div>
        )}
    </div>
  );
};

export default LobbyPage;