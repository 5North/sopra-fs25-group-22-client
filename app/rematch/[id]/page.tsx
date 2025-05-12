"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { getWsDomain } from "@/utils/domain";
import { getUserById } from "@/api/registerService";
import { Button, message as antdMessage } from "antd";

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
  const [messageApi, contextHolder] = antdMessage.useMessage();

  useEffect(() => {
    if (!pin || !token) return;

    const client = new Client({
      brokerURL: getWsDomain() + `/lobby?token=${token}`,
      reconnectDelay: 2000,
      onConnect: () => {
        subscriptionRef.current = client.subscribe(`/topic/lobby/${pin}`, async (message: IMessage) => {
          const data = JSON.parse(message.body);

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
            setLobby(data.lobby);
            console.log("rematcher id: ", data.lobby.rematchersIds)
            const ids = data.lobby.rematchersIds ?? [];

            const fetched = await Promise.all(
              ids.map(async (id: number) => {
                const res = await getUserById(token, id.toString());
                if (!res.ok) throw new Error(`User ${id} fetch failed`);
                const dto = await res.json();
                return { userId: id, username: dto.username };
              })
            );

            setPlayers(fetched);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        // stompClientRef.current = null;
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
          <p style={{ marginBottom: "2rem", color: "#fff", fontSize: "1.2rem" }}>
            You will be redirected to the homepage.
          </p>
          <Button
            type="primary"
            onClick={() => router.push("/home")}
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

      {/* Game Info */}
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
        Game ID: {lobby?.PIN ?? lobby?.lobbyId} 🔗
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

      {/* Start Game Button */}
      {isHost && rematchers.length === 4 && (
        <Button type="primary" onClick={handleStartGame}>
          Start Game
        </Button>
      )}

      {/* Leave Lobby */}
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
