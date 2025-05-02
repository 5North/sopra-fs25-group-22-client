"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Client } from "@stomp/stompjs";
import { getWsDomain } from "@/utils/domain";
import { useRouter } from "next/navigation";

// interface Player {
//   username: string;
//   status: string;
// }

// interface Lobby {
//   lobbyId: string | number;
//   PIN: string | number;
//   players: Player[]
//   roomName?: string | "";
// }

const LobbyPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname()
  // const router = useRouter();
  const { value: token } = useLocalStorage<string>("token", "");
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    const lobbyPIN = pathname;

    const client = new Client({
      brokerURL: getWsDomain() + `/lobby?token=${token}`,
      reconnectDelay: 2000,
      onConnect: () => {
        console.log("Connected to STOMP");
        const pin = lobbyPIN.substring(lobbyPIN.length-4, lobbyPIN.length);
        console.log(`path is: /topic/lobby/${pin}`)
        client.subscribe(`/topic/lobby/${pin}`, (message) => {
          const data = JSON.parse(message.body);
          console.log("Reply from server for lobby topic:", data);
          if (data.success == true && data.message == "Starting game") {
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
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [router, pathname, token]);

  return (
    <div className="register-container">
      {/* the dark overlay */}
      <div className="overlay" />

      {/* your statue image */}
      <img
        src="/images/waiting.png"
        alt="Waiting for players"
        className="waiting-image"
      />

      <h1 className="waiting-text" >
        Waiting for others to join to start the game...
      </h1>
    </div>
  );

};

export default LobbyPage;
