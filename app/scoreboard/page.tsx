"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { getUsers } from "@/api/registerService";

interface UserGetDTO {
  id: number;
  username: string;
  winCount: number;
  lossCount: number;
  tieCount: number;
  rank: number;
}

export default function ScoreboardPage() {
  const [players, setPlayers] = useState<UserGetDTO[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const rawToken = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;
  const rawUserId = typeof window !== "undefined"
    ? localStorage.getItem("userId")
    : null;
  const token = rawToken ? rawToken.replace(/^"|"$/g, "") : null;
  const currentUserId = rawUserId ? Number(rawUserId) : null;
  const router = useRouter();

    useEffect(() => {
        setHydrated(true)
    }, []);

  useEffect(() => {
    const raw = localStorage.getItem("token");
    if (!raw) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    const token = raw.replace(/^"|"$/g, "");

    (async () => {
      try {
        const res = await getUsers(token);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = (await res.json()) as UserGetDTO[];
        // sort by wins desc, then ties desc
        list.sort((a, b) => {
          if (b.winCount !== a.winCount) return b.winCount - a.winCount;
          if (b.tieCount !== a.tieCount) return b.tieCount - a.tieCount;
          return 0; // leave equal ones in fetch order
        });

        // 2) assign “rank” so ties share the same number
        type WithRank = UserGetDTO & { rank: number };
        const ranked: WithRank[] = [];
        let prev: WithRank | null = null;
        list.forEach((u, idx) => {
          const sameAsPrev = prev &&
            u.winCount === prev.winCount &&
            u.tieCount === prev.tieCount &&
            u.lossCount === prev.lossCount;

          const rank = sameAsPrev ? prev!.rank : idx + 1;
          const withRank: WithRank = { ...u, rank };
          ranked.push(withRank);
          prev = withRank;
        });

        setPlayers(ranked);
      } catch (e) {
        console.error("Failed to load scoreboard:", e);
        setError("Could not load scoreboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

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

  if (loading) {
    return <div>Loading…</div>;
  }

  return (
    <div
      style={{
        backgroundImage: `
          radial-gradient(
            circle at center,
            rgba(0,0,0,0) 60%,
            rgba(0,0,0,0.8) 100%
          ),
          url('/images/scoreboard.png')
        `,
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundPosition: "center center, center center",
        backgroundSize: "cover, contain",
        minHeight: "100vh",
        padding: "2rem",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "2rem",
          backgroundColor: "rgba(0,0,0,0.6)",
          borderRadius: "8px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "1rem",
            color: "#61dafb",
            textShadow: "0 0 8px rgba(224,247,255,0.6)",
          }}
        >
          Scoreboard
        </h1>

        {error
          ? <p style={{ color: "salmon", textAlign: "center" }}>{error}</p>
          : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Ranking", "Username", "Wins", "Ties", "Losses"].map((
                    h,
                  ) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.5rem",
                        borderBottom: "1px solid #fff",
                        textAlign: h === "Username" ? "left" : "center",
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
                        backgroundColor: isMe
                          ? "rgba(150,200,255,0.2)"
                          : i % 2 === 0
                          ? "transparent"
                          : "rgba(255, 255,255,0.1)",
                        fontWeight: isMe ? "bold" : "normal",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.5rem",
                          textAlign: "center",
                          color: "#ffab40",
                        }}
                      >
                        {p.rank}
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
      <div
        style={{
          width: "80%",
          margin: "0 auto 1rem",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          type="default"
          onClick={() => router.back()}
          style={{
            position: "absolute",
            bottom: "5rem",
            right: "8rem",
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
