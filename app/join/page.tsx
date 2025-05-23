"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { getUserById } from "@/api/registerService";
import { Client } from "@stomp/stompjs";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getWsDomain } from "@/utils/domain";
import { message } from "antd";

const JoinGamePage: React.FC = () => {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const { value: userIdStr } = useLocalStorage<string>("userId", "");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const isFull = false;
  const [joinError, setJoinError] = useState("");
  const { value: token } = useLocalStorage<string>("token", "");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleInputChange = (index: number, value: string) => {
    const digit = value.replace(/\D/, "").slice(0, 1);
    setDigits((ds) => {
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

    useEffect(() => {
        setHydrated(true)
    }, []);

  // Cleanup: if client exists, deactivate STOMP connection on unmount
  useEffect(() => {
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

          // Check if the user already has a lobbyJoined
          if (!data.success && data.message.includes("already joined")) {
            getUserById(token, userIdStr)
              .then((userRes) => {
                if (!userRes.ok) {
                  throw new Error(`Failed to load user: ${userRes.status}`);
                }
                return userRes.json();
              })
              .then((userDto) => {
                if (userDto.lobbyJoined !== null) {
                  messageApi.open({
                    type: "error",
                    content: "You’re already in a lobby. Sending you there...",
                    style: {
                      backgroundColor: "#000",
                      color: "#f5222d",
                      borderRadius: "4px",
                    },
                  });
                  setTimeout(() => {
                    router.push(`/lobbies/${userDto.lobbyJoined}`);
                  }, 2000);
                }
              })
              .catch((err) => {
                console.error("Error fetching existing lobby:", err);
              });

            return;
          }

          //Join failure
          if (!data.success) {
            setJoinError(data.message);
            clientObj.deactivate();
            console.log("Client deactivated due to join failure.");
          } else {
            // Join Successful
            console.log("Lobby from join:", data.lobby);
            router.push("/lobbies/" + lobbyPIN);
          }
        });

        //Subscribe to broadcast
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

    if(!hydrated) {
        return ;
    }

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
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el; // returns void
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{1}"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
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
        <p style={{ color: "red", marginBottom: "1rem", fontSize: "1rem" }}>
          {joinError}
        </p>
      )}
      {contextHolder}
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
          bottom: "5rem",
          right: "9rem",
          borderRadius: "8px",
        }}
      >
        Back
      </Button>
    </div>
  );
};

export default JoinGamePage;
