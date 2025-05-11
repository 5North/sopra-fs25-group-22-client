"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Client,IMessage, StompSubscription } from "@stomp/stompjs";
import { getWsDomain } from "@/utils/domain";
import { getUserById } from "@/api/registerService"; 
import { Button } from "antd";
import { message as antdMessage } from "antd";



interface Lobby {
  lobbyId: number;
  PIN: string | number;
  hostId: number;
  usersIds: number[];
  rematchersIds: number[] | null;
  players: Player []
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



const LobbyPage: React.FC = () => {
  const router = useRouter();
  const [error] = useState("");
  const { value: token } = useLocalStorage<string>("token", "");
  const username = getUsername();
  const [lobby, setLobby]     = useState<Omit<Lobby,"players"> | null>(null);
  const pathname = usePathname();
  const pin = pathname?.slice(-4) ?? localStorage.getItem("LobbyId");
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messageApi, contextHolder] = antdMessage.useMessage();
 



  useEffect(() => {
    if (!pin || !token) return;
  
    const client = new Client({
      brokerURL: getWsDomain() + `/lobby?token=${token}`,
      reconnectDelay: 2000,
      onConnect: () => {
        console.log("STOMP connected, subscribing to", pin);
  
    
  
        // Subscribe to lobby updates
        subscriptionRef.current = client.subscribe(`/topic/lobby/${pin}`,(message: IMessage) => {
            const data = JSON.parse(message.body);
            console.log("Received lobby update:", data);

            if (data.success === true && data.message === "Starting game") {
              console.log("Starting game, redirecting to /game/", pin);
              router.push(`/game/${pin}`);
              return;  
            }

            if (data.lobby) {
              // stash the raw lobby
              setLobby(data.lobby);
              (async () => {
                try {
                  const fetched: Player[] = await Promise.all(
                    data.lobby.usersIds.map(async (id: number) => {
                      const res = await getUserById(token, id.toString());
                      if (!res.ok) throw new Error(`User ${id} failed`);
                      const dto = await res.json();
                      return { userId: id, username: dto.username };
                    })
                  );
                  setPlayers(fetched);

                  setPlayers(fetched);
                } catch (err) {
                  console.error("Failed to load player names:", err);
                }
              })
              ();
            }

             // lobby deleted by host
            if (data.message?.includes("has been deleted")) {
              // show a red error toast
              messageApi.open({
                type:    "error",
                content: "The host left the lobby. Redirecting to hompage...",
                style: {
                  backgroundColor: "#000",  
                  color:           "#f5222d",     
                  borderRadius:    "4px",
                }
              });

              
              setTimeout(() => {
                router.push("/home");
              }, 2000);

              return; 
            }
  
          }
        );
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
          stompClientRef.current = null;
        }
      };
    
  }, [router, token, pin]);

  const handleBack = () => {
    router.push("/home");
  };

  const handleStartGame = () => {
    if (!lobby) return; 

    console.log("handle start game called..")
    if(!stompClientRef.current) {
      console.log("STOMP REF NOT EXISTING!!!");
    }

    stompClientRef.current?.publish({
      destination: `/app/startGame/${String(lobby.lobbyId)}`,
      body: '',
    });
  
    router.push(`/game/${lobby.lobbyId}`);
  };
  
  useEffect(() => {
    if (!token || !lobby?.usersIds?.length) {
      setPlayers([]);
      return;
    }

    const loadPlayers = async () => {
      try {
        const fetched = await Promise.all(
          lobby.usersIds.map(async (id) => {
            const res = await getUserById(token, id.toString());
            if (!res.ok) {
              throw new Error(`Failed to load user ${id}: ${res.status}`);
            }
            const dto = await res.json();
            return { userId: id, username: dto.username };
          })
        );
        setPlayers(fetched);
      } catch (err) {
        console.error("Error fetching players:", err);
      }
    };

    loadPlayers();
  }, [token, lobby?.usersIds]);

   const hostUsername = React.useMemo(() => {
    if (!lobby || players.length === 0) return "";
    const firstId = lobby.usersIds[0];
    return players.find(p => p.userId === firstId)?.username || "";
  }, [lobby, players]);

  if (error) {
    return (
      <div className="register-container">
        <div className="auth-wrapper">
          <h1 style={{ color: "#fff" }}>Error</h1>
          <p style={{ color: "red" }}>{error}</p>
          <Button onClick={handleBack}>Back</Button>
        </div>
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="register-container">
        <div className="auth-wrapper">
          <h1 style={{ color: "#fff" }}>Loading...</h1>
        </div>
      </div>
    );
  }


  const handleLeaveLobby = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      console.log(`Unsubscribed from /topic/lobby/${lobby.lobbyId}`);
      subscriptionRef.current = null;
    }

    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    router.push("/home"); 
  };


  return (
    <>
      {contextHolder}
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
      {/* Game-ID Pill */}
      <h2
        style={{
          margin: "7rem 0 0.5rem",
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "#00e5ff",                // neon-blue
          border: "1px solid #00e5ff",
          boxShadow: "0 0 8px rgba(0,229,255,0.5)",
          fontWeight: "normal",
        }}
      >
        Game ID: {lobby.PIN ?? lobby.lobbyId} 🔗
      </h2>
       <p
        style={{
          margin: 0,
          padding: "0.25rem 1rem",
          color: "#fff",
          fontSize: "1rem",
          textAlign: "center",
          textShadow: "0 0 4px rgba(0,229,255,0.6)",
          lineHeight:"1.2",
        }}
      >
        4 players required
      </p>
      <p
        style={{
          margin:    "0.25rem 0 1.5rem", 
          padding:   "0 1rem",
          fontSize:  "1rem",
          textAlign: "center",
          textShadow:"0 0 4px rgba(0,229,255,0.6)",
          lineHeight:"1.2",
        }}
      >
        Only the host can start the game
      </p>
      

      {/* Teams row */}
      <div
        className="team-wrapper"
        style={{
          display: "flex",
          gap: "2rem",
          width: "100%",
          maxWidth: "700px",
          marginBottom: "3rem",
        }}
      >
        {["Team 1", "Team 2"].map((label, teamIndex) => (
          <div
            key={label}
            className="team-box"
            style={{
              flex: "0 0 45%",
              maxWidth: "45%", 
              backgroundColor: "rgba(0,0,0,0.4)",    
              border: "1px solid #00e5ff",
              borderRadius: "0.5rem",
              padding: "0.5rem",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#00e5ff" }}>{label}</h3>
            {(players ?? [])
              .filter((_, i) => i % 2 === teamIndex)
              .map((p, i) => (
                <p key={i} style={{ margin: "0.5rem 0", color: "#fff" }}>
                  {p.username} joined
                </p>
              ))}
          </div>
        ))}
      </div>

      {/* Start button */}
      {players?.length === 4 &&
        hostUsername === username && (
          <div>
          <Button
            type="primary"
            onClick={handleStartGame}
          >
            Start Game
          </Button>
          </div>
        )}
            {/* Leave Lobby Button */}
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
    </>
  );
};

export default LobbyPage;
