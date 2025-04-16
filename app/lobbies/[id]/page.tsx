"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Client, IMessage } from "@stomp/stompjs";
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

        console.log("attempt to subscribe to games");
        // client.subscribe(`/app/startGame/${lobbyPIN}`, (message:IMessage) => {
        //   console.log("Connected to Start Game...");
        //   const data = JSON.parse(message.body);

        //   console.log("received...: " + JSON.stringify(data));
        //   if (data.lobbyId == Number(lobbyPIN)) {
        //     router.push(`/game/${lobbyPIN}`);
        //     // console.log("Client deactivated due to join failure.");
        //   }
        // });
        client.subscribe(`/topic/lobby/${lobbyPIN}`, (message) => {
          const data = JSON.parse(message.body);
          console.log("Reply from server for lobby topic:", data);
        });

        client.subscribe("/user/queue/reply", (message) => {
          const data = JSON.parse(message.body);
          console.log("Reply from queue:", data);
          if (JSON.stringify(data).includes("handCards")) {
            console.log("Client deactivated due to join failure.");
            router.push("/game/" + lobbyPIN.substring(lobbyPIN.length-5, lobbyPIN.length-1));
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
      <h1 style={{ marginBottom: "6rem" }}>🏁</h1>
      <h1>Waiting for others to join to start the game...</h1>
    </div>
  );
};

export default LobbyPage;
