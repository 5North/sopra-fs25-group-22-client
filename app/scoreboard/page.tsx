"use client";

import React from "react";

export default function ScoreboardPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        backgroundColor: "#16181D",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        📊 Scoreboard
      </h1>
      <p style={{ fontSize: "1.25rem", opacity: 0.75 }}>
        (Coming soon…)
      </p>
    </div>
  );
}
