"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { joinLobby } from "@/api/registerService"; 

const JoinGamePage: React.FC = () => {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [isFull, setIsFull] = useState(false);
  const [joinError, setJoinError] = useState("");

  const handleInputChange = (index: number, value: string) => {
    const newDigits = [...digits];
    newDigits[index] = value.replace(/\D/g, "").slice(0, 1);
    setDigits(newDigits);
  };

  const handleJoin = async () => {
    const lobbyPIN = digits.join("");
    if (lobbyPIN.length !== 4) {
      alert("Please enter a 4-digit Game ID.");
      return;
    }

    //TODO verify if backend needs username or if token is enough
    const username = localStorage.getItem("username");
    if (!username) {
        alert("Username not found. Please log in again.");
        return;
      }


    try {
      const token = localStorage.getItem("token"); 
      if (!token) {
        alert("User not authenticated");
        return;
      }

      // Call the joinLobby function from registerService.ts
      const response = await joinLobby(token, lobbyPIN, {
        username //TODO modify username depending what backend needs
      });

      // MOCK API
      //const response = new Response(
      //  JSON.stringify({ message: "join successful" }),
      //  {
      //    status: 200,
      //    headers: { "Content-Type": "application/json" },
      //  }
      //);

      // Check if the lobby is full 
      if (response.status === 409) {
        setIsFull(true);
        return;
      }

      if (response.status === 404) {
        setJoinError("GameRoom does not exist");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setJoinError(errorData.error || "An error occurred while joining the lobby.");
        return;
      }

      // If join is successful, navigate to the lobby page
      router.push(`/lobbies/${lobbyPIN}`);
    } catch (error) {
      console.error("Error joining lobby:", error);
      setJoinError("An unexpected error occurred.");
    }
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


