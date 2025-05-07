"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { UserListElement } from "@/models/GameSession";
import { getWsDomain } from "@/utils/domain";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getUsers } from "@/api/registerService";
import Image from "next/image";

export default function RematchPage() {
  const { id } = useParams();
  const [allUsers, setAllUsers] = useState<UserListElement[]>([]);
  const stompClientRef = useRef<Client | null>(null);
  const { value: token } = useLocalStorage<string>("token", "");
  const subscriptionRef = useRef<StompSubscription | null>(null);

  const getUserIdByUsername = (username: string): number | null => {
    const user = allUsers.find(u => u.username === username);
    return user ? user.id : null;
  };

  const getCurrentUserId = (): number | null => {
    if (typeof window !== "undefined") {
      const userName = localStorage.getItem("username");
      if (userName) {
        return getUserIdByUsername(userName);
      }
    }
    return null;
  };

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      try {
        const response = await getUsers(token);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const users: UserListElement[] = await response.json();
        console.log("Fetched users:", users);
        setAllUsers(users);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [token]);

  useEffect(() => {
    // Create STOMP client
    const client = new Client({
      brokerURL: getWsDomain() + `/lobby?token=${token}`,
      reconnectDelay: 2000,
      debug: (msg) => {
        console.log("[STOMP]", msg);
      },
      onConnect: () => {
        console.log("Connected to game WebSocket");

        // Subscribe to public game state updates
        subscriptionRef.current = client.subscribe(`/topic/lobby/${id}`, (message: IMessage) => {
          try {
            const payload = JSON.parse(message.body);
            console.log("==> PUBLIC MESSAGE message received:", payload);
          } catch (err) {
            console.error("Error processing game state update", err);
          }
        });

        client.subscribe("/user/queue/reply", (message: IMessage) => {
          try {
            const payload = JSON.parse(message.body);
            console.log("Private message received:", payload);
          } catch (err) {
            console.error("Error processing private message:", err);
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
      }
    };
  }, [id, token, currentUserId]);

  // const unsubscribeFromGame = () => {
  //   if (subscriptionRef.current) {
  //     subscriptionRef.current.unsubscribe();
  //     console.log(`Unsubscribed from /topic/lobby/${id}`);
  //     subscriptionRef.current = null;
  //   }
  // };

  return (
    <div className="register-container">
      {/* Dark overlay */}
      <div className="overlay" />

      {/* Statue image */}
      <Image
        src="/images/waiting.png"
        alt="Waiting for players"
        className="waiting-image"
        width={200}
        height={400}
      />

      <h1 className="waiting-text">
        Waiting for others to join to start the game...
      </h1>

      {/* Leave Lobby Button */}
      {/* <Button
            onClick={handleLeaveLobby}
            style={{
              position: "absolute",
              bottom: "5rem",
              right: "5rem",
              borderRadius: "8px",
            }}
            
          >
            Leave Lobby
          </Button> */}
    </div>
  );
}

