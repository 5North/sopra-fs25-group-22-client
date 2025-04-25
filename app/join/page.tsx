"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { Client } from "@stomp/stompjs";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getWsDomain } from "@/utils/domain";

const JoinGamePage: React.FC = () => {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [joinError, setJoinError] = useState("");
  const { value: token } = useLocalStorage<string>("token", "");
  const [client, setClient] = useState<Client | null>(null);

  // Advance focus when typing
  const handleInputChange = (index: number, value: string) => {
    const digit = value.replace(/\D/, "").slice(0, 1);
    setDigits(ds => {
      const copy = [...ds];
      copy[index] = digit;
      return copy;
    });
    if (digit && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Backspace jumps back
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Clean-up STOMP on unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [client]);

  const handleJoin = () => {
    const lobbyPIN = digits.join("");
    if (lobbyPIN.length !== 4) {
      alert("Please enter a 4-digit Game ID.");
      return;
    }
    const clientObj = new Client({
      brokerURL: `${getWsDomain()}/lobby?token=${token}`,
      reconnectDelay: 2000,
      onConnect: () => {
        clientObj.subscribe("/user/queue/reply", msg => {
          const data = JSON.parse(msg.body);
          if (!data.success) {
            setJoinError(data.message);
            clientObj.deactivate();
          } else {
            router.push(`/lobbies/${lobbyPIN}`);
          }
        });
      },
      onStompError: frame => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });
    setClient(clientObj);
    clientObj.activate();
  };

  const handleBack = () => router.push("/home");
  const handleStartOwnGame = () => router.push("/lobbies");

  // Shared container style
  const containerStyle: React.CSSProperties = {
    width: "100vw",
    height: "100vh",
    boxSizing: "border-box",
    backgroundColor: "#000",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    padding: "2rem",
    position: "relative",
  };

  // (You can re-enable this if you implement isFull)
  const isFull = false;
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
    <div style={containerStyle}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Scopa for Beginners
      </h1>
      <p>Enter Game ID</p>

      <div style={{ display: "flex", gap: "1rem", margin: "2rem 0" }}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={el => {
              inputsRef.current[i] = el;  // returns void
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{1}"
            maxLength={1}
            value={digit}
            onChange={e => handleInputChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(e, i)}
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

      {joinError && (
        <p style={{ color: "red", marginBottom: "1rem" }}>{joinError}</p>
      )}

      <Button
        type="primary"
        disabled={!token || digits.some(d => d === "")}
        onClick={handleJoin}
        style={{ marginBottom: "1rem", width: "150px", height: "40px" }}
      >
        Join Game
      </Button>
      <Button onClick={handleBack}>Back</Button>
    </div>
  );
};

export default JoinGamePage;
