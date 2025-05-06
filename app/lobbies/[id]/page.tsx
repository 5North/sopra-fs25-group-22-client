"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Client, StompSubscription } from "@stomp/stompjs";
import { getWsDomain } from "@/utils/domain";
import Image from "next/image";

const LobbyPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { value: token } = useLocalStorage<string>("token", "");
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  // Extract pin safely from path
  const pin = pathname?.slice(-4);

  useEffect(() => {
    if (!pin || !token) return;

    const client = new Client({
      brokerURL: getWsDomain() + `/lobby?token=${token}`,
      reconnectDelay: 2000,
      onConnect: () => {
        console.log("Connected to STOMP");

        subscriptionRef.current = client.subscribe(`/topic/lobby/${pin}`, (message) => {
          const data = JSON.parse(message.body);
          console.log("Reply from server for lobby topic:", data);
          if (data.success === true && data.message === "Starting game") {
            router.push("/game/" + pin);
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
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [pin, token, router]);

  const handleLeaveLobby = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      console.log(`Unsubscribed from /topic/lobby/${pin}`);
      subscriptionRef.current = null;
    }

    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    router.push("/home"); // Go back to home or lobby select
  };

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
      <div
        onClick={handleLeaveLobby}
        className="neon-button"
        style={{
          position: "fixed",
          bottom: "160px",
          right: "20px",
          backgroundColor: "transparent",
          borderRadius: "20px",
          padding: "10px 20px",
          color: "#0ff",
          fontWeight: "bold",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 8px rgb(133, 251, 255), 0 0 16px rgb(133, 251, 255)",
          cursor: "pointer",
          border: "2px solid #0ff",
          zIndex: 1001,
        }}
        title="Leave Lobby"
      >
        Leave Lobby
      </div>
    </div>
  );
};

export default LobbyPage;
