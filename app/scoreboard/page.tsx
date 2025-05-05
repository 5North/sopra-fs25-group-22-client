"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {Button } from "antd";
import { getUsers } from "@/api/registerService";
import useLocalStorage from "@/hooks/useLocalStorage";

interface UserGetDTO {
  id:         number;
  username:   string;
  winCount:   number;
  lossCount:  number;
  tieCount:   number;
}

export default function ScoreboardPage() {
  const [players, setPlayers] = useState<UserGetDTO[]>([]);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const rawToken   = typeof window !== "undefined" ? localStorage.getItem("token")   : null;
  const rawUserId  = typeof window !== "undefined" ? localStorage.getItem("userId")  : null;
  const token      = rawToken  ? rawToken.replace(/^"|"$/g, "") : null;
  const currentUserId = rawUserId ? Number(rawUserId)          : null;
  const router = useRouter();


  useEffect(() => {
    // 1) grab token from localStorage
    const raw = localStorage.getItem("token");
    if (!raw) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    const token = raw.replace(/^"|"$/g, "");


    // 2) fetch all users
    (async () => {
      try {
        const res = await getUsers(token);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = (await res.json()) as UserGetDTO[];
        // sort by wins desc, then ties desc
        list.sort((a, b) =>
          b.winCount !== a.winCount
            ? b.winCount - a.winCount
            : b.tieCount - a.tieCount
        );
        setPlayers(list);
      } catch (e) {
        console.error("Failed to load scoreboard:", e);
        setError("Could not load scoreboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);



  if (loading) {
    return <div>Loading…</div>;
  }

  return (
    <div
      style={{
        backgroundImage: "url('/images/scoreboard.png')",
        backgroundSize:    "contain",
        backgroundRepeat:  "no-repeat",
        backgroundPosition:"center",
        minHeight:         "100vh",
        padding:           "2rem",
        color:             "white",
      
      }}
    >
      <div
        style={{
          maxWidth:       700,
          margin:         "0 auto",
          padding:        "2rem",
          backgroundColor:"rgba(0,0,0,0.6)",
          borderRadius:   "8px",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "1rem", color: "#61dafb",  
                  textShadow: "0 0 8px rgba(224,247,255,0.6)", }}>
          Scoreboard
        </h1>

        {error ? (
          <p style={{ color: "salmon", textAlign: "center" }}>{error}</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Ranking", "Username", "Wins", "Ties", "Losses"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding:      "0.5rem",
                      borderBottom: "1px solid #fff",
                      textAlign:    h === "Username" ? "left" : "center",
                      color: "#61dafb",  
                      textShadow: "0 0 4px rgba(133, 251, 255,0.6)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => {
                const isMe = p.id === currentUserId;
                return (
                <tr
                  key={p.id}
                  style={{
                    backgroundColor: isMe ? "rgba(150,200,255,0.2)" :
                      i % 2 === 0 ? "transparent" : "rgba(255, 255,255,0.1)",
                      fontWeight: isMe ? "bold" : "normal",
                  }}
                >
                  <td style={{ padding: "0.5rem", textAlign: "center" , color: "#ffab40"}}>
                    {i + 1}
                  </td>
                  <td style={{ padding: "0.5rem" }}>{p.username}</td>
                  <td style={{ padding: "0.5rem", textAlign: "center" }}>
                    {p.winCount}
                  </td>
                  <td style={{ padding: "0.5rem", textAlign: "center" }}>
                    {p.tieCount}
                  </td>
                  <td style={{ padding: "0.5rem", textAlign: "center" }}>
                    {p.lossCount}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div style={{ width: '80%', margin: '0 auto 1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="default"
          onClick={() => router.back()}
          style={{
            position:   "absolute",
            bottom:     "5rem",
            right:      "8rem",
            color: "#fff",
            borderColor: "#fff",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          Back
        </Button>
      </div>
    </div>
  );
}



