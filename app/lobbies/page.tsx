"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { createLobby } from "@/api/registerService";
import useLocalStorage from "@/hooks/useLocalStorage";

interface Player {
  username: string;
  host?: boolean;
}

const LobbyPage: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [lobby, setLobby] = useState<any>(null);

  // Retrieve the user's token from local storage via your custom hook.
  const { value: token } = useLocalStorage<string>("token", "");

  useEffect(() => {
    const autoCreateLobby = async () => {
      setError("");

      if (!token) {
        setError("User not authenticated. Please log in.");
        return;
      }

      try {
        
        const response = await createLobby(token, {}); //TODO how should the user that is hosting be sent to backend
        if (!response.ok) {
          if (response.status === 400) {
            setError("Invalid input or missing data.");
          } else {
            setError("Failed to create lobby. Please try again.");
          }
          return;
        }
        const data = await response.json();
        setLobby(data);
      

        // --- MOCK RESPONSE (for testing) ---
        //const data = {
        //  lobbyId: 1,
        //  PIN: 1234,
        //  players: [
        //    { username: "shellmy", host: true },
        //    { username: "ha", host: false }
        //  ]
        //};

        setLobby(data);
      } catch (err: any) {
        setError("An error occurred while creating the lobby.");
        console.error("Lobby creation error:", err);
      }
    };

    autoCreateLobby();
  }, [token]);

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
      <div className="auth-wrapper">
        <div
          style={{
            backgroundColor: "#2F2F2F",
            borderRadius: "8px",
            padding: "2rem",
            textAlign: "center",
            color: "#fff",
            minWidth: "300px",
          }}
        >
          <h1 style={{ marginBottom: "1rem" }}>Game Created</h1>
          <p>Share your Game Room ID with your friends to join in</p>
          <h2 style={{ margin: "1rem 0" }}>
            Game ID: {lobby.PIN ?? lobby.lobbyId}
          </h2>
          <p style={{ fontStyle: "italic" }}>Waiting for players to join...</p>
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
          <div style={{ marginTop: "2rem" }}>
            <Button onClick={handleBack}>Back</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
