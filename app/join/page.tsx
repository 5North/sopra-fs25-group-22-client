"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { Client } from "@stomp/stompjs";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain, getWsDomain } from "@/utils/domain";

const JoinGamePage: React.FC = () => {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [isFull, setIsFull] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [lobbyPINtoJoin, setPIN] = useState("");
  const { value: token } = useLocalStorage<string>("token", "");
  const [client, setClient] = useState<Client | null>(null);

  const handleInputChange = (index: number, value: string) => {
    const newDigits = [...digits];
    newDigits[index] = value.replace(/\D/g, "").slice(0, 1);
    setDigits(newDigits);
  };

  useEffect(() => {
    return () => {
      if (client) {
        console.log("Deactivating STOMP connection...");
        client.deactivate();
      }
    };
  }, [lobbyPINtoJoin, token]);
  
  const handleJoin = async () => {
    const lobbyPIN = digits.join("");
    if (lobbyPIN.length !== 4) {
      alert("Please enter a 4-digit Game ID.");
      return;
    }
    setPIN(lobbyPIN)
    // alert(lobbyPIN)
    const clientObj = new Client({
      brokerURL: getWsDomain() + `/lobby?token=${token}`, // TODO: fix the url strings
      reconnectDelay: 2000,
      onConnect: () => {
        console.log("Connected to STOMP");
  
        clientObj.subscribe("/user/queue/reply", (message) => {
          const data = JSON.parse(message.body);
          console.log("Reply message:", message.body);
          if (!data.success) {
            setJoinError(data.message);
          } else {
            router.push("/lobbies/" + lobbyPIN);
          }
        });
  
        clientObj.subscribe(`/topic/lobby/${lobbyPIN}`, (message) => {
          console.log("Lobby subscription message:", message.body);
          
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });
  
    setClient(clientObj);
    console.log("Activating STOMP connection...");
    clientObj.activate();
    // TODO: need to deactivate somewhere
  };

  const handleBack = () => {
    router.push("/home");
  };

  const handleStartOwnGame = () => {
    router.push("/lobbies");
  };

  // Container style used for both states (full screen, black background)
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

  // If the lobby is full, display the "Game Room Full" state
  if (isFull) {
    return (
      <div style={containerStyle}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          Scopa for Beginners
        </h1>
        {/* Display the 4 entered digits as read-only */}
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

 
  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Scopa for Beginners
      </h1>
      <p style={{ marginBottom: "1rem" }}>Enter Game ID</p>
      {/* Container for the 4-digit inputs */}
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


