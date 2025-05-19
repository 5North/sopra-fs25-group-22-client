"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { getWsDomain } from "@/utils/domain";
import { getUserById } from "@/api/registerService";
import { Button } from "antd";

interface Lobby {
  lobbyId: number;
  PIN: string | number;
  hostId: number;
  rematchersIds: number[] | null;
}

interface Player {
  userId: number;
  username: string;
}

const getUsername = (): string => {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("username") || "";
  try {
    return String(JSON.parse(stored));
  } catch {
    return stored;
  }
};

const RematchPage: React.FC = () => {
  const router = useRouter();
  const { value: token } = useLocalStorage<string>("token", "");
  const username = getUsername();
  const pathname = usePathname();
  const pin = pathname?.slice(-4) ?? localStorage.getItem("LobbyId");

  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [hostLeft, setHostLeft] = useState(false);
  const [rematchFailed, setRematchFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pin || !token) return;

    const noMessageTimeout = setTimeout(() => {
      console.warn(
        "No message received within timeout. Triggering rematch failure.",
      );
      setRematchFailed(true);
    }, 2500);

    const client = new Client({
      brokerURL: getWsDomain() + `/lobby?token=${token}`,
      reconnectDelay: 2000,
      onConnect: () => {
        subscriptionRef.current = client.subscribe(
          `/topic/lobby/${pin}`,
          async (message: IMessage) => {
            clearTimeout(noMessageTimeout);
            setLoading(false);
            const data = JSON.parse(message.body);

            console.log("Lobby message: " + JSON.stringify(data));

            if (data.message?.includes("has been deleted")) {
              setHostLeft(true);
              return;
            }

            if (data.success === true && data.message === "Starting game") {
              router.push(`/game/${pin}`);
              return;
            }

            if (data.lobby) {
              console.log("FULL lobby update:", data);

              if (data.lobby.usersIds && data.lobby.usersIds.length < 4) {
                setRematchFailed(true);
                return;
              }

              setLobby(data.lobby);
              const ids = data.lobby.rematchersIds ?? [];

              const fetched = await Promise.all(
                ids.map(async (id: number) => {
                  const res = await getUserById(token, id.toString());
                  if (!res.ok) throw new Error(`User ${id} fetch failed`);
                  const dto = await res.json();
                  return { userId: id, username: dto.username };
                }),
              );

              setPlayers(fetched);
            }
          },
        );
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      clearTimeout(noMessageTimeout);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [router, token, pin]);

  const handleStartGame = () => {
    if (!lobby || !stompClientRef.current) return;

    stompClientRef.current?.publish({
      destination: `/app/startGame/${String(lobby.lobbyId)}`,
      body: "",
    });

    router.push(`/game/${lobby.lobbyId}`);
  };

  const handleLeaveLobby = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
    router.push("/home");
  };

  const isHost = useMemo(() => {
    const myself = players.find((p) => p.username === username);
    return lobby && myself?.userId === lobby.hostId;
  }, [players, lobby, username]);

  const rematchers = players;

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

  return (
    <div
      className="register-container"
      style={{
        position: "relative",
        color: "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        height: "100vh",
      }}
    >
      {/* Host Left Popup */}
      {hostLeft && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            color: "#f5222d",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <h2
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              padding: "1rem 2rem",
              borderRadius: "0.5rem",
              border: "1px solid #f5222d",
              boxShadow: "0 0 8px rgba(245,34,45,0.7)",
              marginBottom: "2rem",
            }}
          >
            The host left the lobby.
          </h2>
          <p
            style={{ marginBottom: "2rem", color: "#fff", fontSize: "1.2rem" }}
          >
            You will be redirected to the homepage.
          </p>
          <Button
            type="primary"
            onClick={handleLeaveLobby}
            style={{
              backgroundColor: "#f5222d",
              borderColor: "#f5222d",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "8px",
              padding: "0.5rem 1.5rem",
              boxShadow: "0 0 10px rgba(245,34,45,0.6)",
            }}
          >
            Go to Home
          </Button>
        </div>
      )}

      {/* Rematch Failed Popup */}
      {rematchFailed && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            color: "#f5222d",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <h2
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              padding: "1rem 2rem",
              borderRadius: "0.5rem",
              border: "1px solid #f5222d",
              boxShadow: "0 0 8px rgba(245,34,45,0.7)",
              marginBottom: "2rem",
            }}
          >
            Rematch not possible!
          </h2>
          <p
            style={{ marginBottom: "2rem", color: "#fff", fontSize: "1.2rem" }}
          >
            Not all users accepted the rematch.
          </p>
          <Button
            type="primary"
            onClick={handleLeaveLobby}
            style={{
              backgroundColor: "#f5222d",
              borderColor: "#f5222d",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "8px",
              padding: "0.5rem 1.5rem",
              boxShadow: "0 0 10px rgba(245,34,45,0.6)",
            }}
          >
            Go to Home
          </Button>
        </div>
      )}

      {/* Loading while waiting for message */}
      {loading && !rematchFailed && !hostLeft && (
        <div
          style={{
            marginTop: "7rem",
            fontSize: "1.25rem",
            color: "##FFFFFF",
            textShadow: "0 0 8px rgba(0,229,255,0.4)",
          }}
        >
          Loading lobby info...
        </div>
      )}

      {/* Game Info Section */}
      {!loading && lobby && (
        <>
          <h2
            style={{
              margin: "7rem 0 0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "#00e5ff",
              border: "1px solid #00e5ff",
              boxShadow: "0 0 8px rgba(0,229,255,0.5)",
              fontWeight: "normal",
            }}
          >
            Game ID: {lobby.PIN ?? lobby.lobbyId} 🔗
          </h2>

          <p style={{ color: "#fff", marginBottom: "1rem" }}>
            Rematchers: {rematchers.length}/4
          </p>

          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              border: "1px solid #00e5ff",
              borderRadius: "0.5rem",
              padding: "1rem",
              minWidth: "300px",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            {rematchers.map((p) => (
              <p key={p.userId} style={{ margin: "0.5rem 0", color: "#fff" }}>
                {p.username} is ready
              </p>
            ))}
          </div>

          {isHost && (
            <Button
              type="primary"
              onClick={handleStartGame}
              disabled={rematchers.length < 4}
            >
              Start Game
            </Button>
          )}
        </>
      )}

      {/* Leave Button */}
      <Button
        onClick={handleLeaveLobby}
        style={{
          position: "absolute",
          bottom: "5rem",
          right: "5rem",
          borderRadius: "8px",
        }}
      >
        Leave Lobby
      </Button>
    </div>
  );
};

export default RematchPage;
