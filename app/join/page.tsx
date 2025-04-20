"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { Client } from "@stomp/stompjs";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getWsDomain } from "@/utils/domain";

const JoinGamePage: React.FC = () => {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const isFull = false;
  const [joinError, setJoinError] = useState("");
  //const [lobbyPINtoJoin, setPIN] = useState("");
  const { value: token } = useLocalStorage<string>("token", "");
  const [client, setClient] = useState<Client | null>(null);

  const handleInputChange = (index: number, value: string) => {
    const newDigits = [...digits];
    newDigits[index] = value.replace(/\D/g, "").slice(0, 1);
    setDigits(newDigits);
  };

  useEffect(() => {
    // Cleanup: if client exists, deactivate STOMP connection on unmount
    return () => {
      if (client) {
        console.log("Deactivating STOMP connection...");
        client.deactivate();
      }
    };
  }, [client]);
  
  const handleJoin = async () => {
    const lobbyPIN = digits.join("");
    if (lobbyPIN.length !== 4) {
      alert("Please enter a 4-digit Game ID.");
      return;
    }
  
    console.log("Current token:", token);
    console.log("Joining lobby with Pin:", lobbyPIN);
  
    const clientObj = new Client({
      brokerURL: getWsDomain() + `/lobby?token=${token}`,
      reconnectDelay: 2000,
      onConnect: () => {
        console.log("Connected to STOMP");
  
        // Subscribe to the personal reply queue for the join response
        clientObj.subscribe("/user/queue/reply", (message) => {
          const data = JSON.parse(message.body);
          console.log("Reply from server:", data);
          if (!data.success) {
            setJoinError(data.message);
            clientObj.deactivate();
            console.log("Client deactivated due to join failure.");
          } else {
            console.log("from user queue...")
            router.push("/lobbies/" + lobbyPIN);
          }
        });

        clientObj.subscribe(`/topic/lobby/${lobbyPIN}`, (message) => {
          const data = JSON.parse(message.body);
          console.log("Reply from server for lobby:", data);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });
  
    setClient(clientObj);
    console.log("Activating STOMP connection...");
    clientObj.activate();
  };

  const handleBack = () => {
    router.push("/home");
  };

  const handleStartOwnGame = () => {
    router.push("/lobbies");
  };

  // Common container style
  const containerStyle: React.CSSProperties = {
    width: "100vw",
    height: "100vh",
    boxSizing: "border-box",
    backgroundColor: "#000000",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    padding: "2rem",
  };

  // If lobby is full, display the "Game Room Full" state
  if (isFull) {
    return (
      <div style={containerStyle}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          Scopa for Beginners
        </h1>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            margin: "2rem 0",
          }}
        >
          {digits.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              value={digit}
              readOnly
              style={{
                width: "60px",
                height: "60px",
                fontSize: "2rem",
                textAlign: "center",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                color: "#000",
              }}
            />
          ))}
        </div>
        <p style={{ marginBottom: "2rem", fontSize: "1.2rem" }}>
          Game Room Full
        </p>
        <Button
          onClick={handleStartOwnGame}
          style={{
            width: "180px",
            height: "40px",
            fontSize: "1rem",
            borderRadius: "8px",
            marginBottom: "2rem",
          }}
        >
          Start your own Game
        </Button>
        <Button
          onClick={handleBack}
          disabled={digits.join("").length !== 4}
          style={{
            position: "absolute",
            bottom: "1rem",
            right: "1rem",
            borderRadius: "8px",
          }}
        >
          Back
        </Button>
      </div>
    );
  }

  // Regular join UI
  return (
    <div style={containerStyle} className="register-container">
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Scopa for Beginners
      </h1>
      <p style={{ marginBottom: "1rem" }}>Enter Game ID</p>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          margin: "2rem 0",
        }}
      >
        {digits.map((digit, idx) => (
          <input
            key={idx}
            type="text"
            value={digit}
            onChange={(e) => handleInputChange(idx, e.target.value)}
            style={{
              width: "60px",
              height: "60px",
              fontSize: "2rem",
              textAlign: "center",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              color: "#000",
            }}
            maxLength={1}
          />
        ))}
      </div>
      {joinError && (
        <p style={{ color: "red", marginBottom: "1rem", fontSize: "1rem" }}>
          {joinError}
        </p>
      )}
      <Button
        type="primary"
        disabled={!token || digits.some((d) => d === "")}
        onClick={handleJoin}
        style={{
          width: "150px",
          height: "40px",
          fontSize: "1rem",
          borderRadius: "8px",
        }}
      >
        Join Game
      </Button>
      <Button
        onClick={handleBack}
        style={{
          position: "absolute",
          bottom: "1rem",
          right: "1rem",
          borderRadius: "8px",
        }}
      >
        Back
      </Button>
    </div>
  );
};

export default JoinGamePage;



