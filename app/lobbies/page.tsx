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
  host?: boolean;
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
        setLobby(data);

      } catch (err) {
        setError("An error occurred while creating the lobby.");
        console.error("Lobby creation error:", err);
      }
    };

    autoCreateLobby();
  }, [token]);

  useEffect(() => {
    if (lobby) {
      const client = new Client({
        brokerURL: getWsDomain() + `/lobby?token=${token}`,
        reconnectDelay: 2000,
        onConnect: () => {
          console.log("Connected to STOMP");

          client.subscribe(`/topic/lobby/${lobby.lobbyId}`, (message: IMessage) => {
            const data = JSON.parse(message.body);
            console.log("Received lobby update:", data);
            // TODO: Each time received an update add the user 

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
    }
  }, [lobby, token]);

  const handleBack = () => {
    router.push("/home");
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
          {lobby.players?.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              {lobby.players.map((player: Player, idx: number) => (
                <p key={idx}>
                  {player.username}
                  {player.host ? " (Host)" : ""} joined
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="team-box">
          <h3> Team 2 </h3>
          {lobby.players?.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              {lobby.players.map((player: Player, idx: number) => (
                <p key={idx}>
                  {player.username}
                  {player.host ? " (Host)" : ""} joined
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
      <h2 style={{ marginBottom: "6rem" }}>🏁</h2>
      <div><Button type="primary" htmlType="submit" className="custom-button" disabled={lobby.players?.length !== 4}>♣️Start Game</Button></div>
    </div>
  );
};

export default LobbyPage;
