"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Client, IMessage } from "@stomp/stompjs";
import { getWsDomain } from "@/utils/domain";

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

        client.subscribe(`/topic/lobby/${lobbyPIN}`, (message: IMessage) => {
          const data = JSON.parse(message.body);
          console.log("Received lobby update:", data);
        
          /// ?? may be not needed
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
  }, [pathname, token]);

  // const handleBack = () => {
  //   router.push("/home");
  // };

  return (
    <div className="register-container">
      <h1 style={{ marginBottom: "6rem" }}>🏁</h1>
      <h1>Waiting for others to join to start the game...</h1>
    </div>
  );
};

export default LobbyPage;
