"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Card, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

/** Adjust the interface below to match what your backend returns for each lobby. */
interface Lobby {
  id: number;
  name: string;
  // e.g. players?: number; or any other fields from your response
  // ...
}

export default function LobbiesPage() {
  const router = useRouter();
  const apiService = useApi();
  const [lobbies, setLobbies] = useState<Lobby[] | null>(null);

  // We'll grab the `clear` function to let us logout if needed:
  const { clear: clearToken } = useLocalStorage<string>("token", "");

  useEffect(() => {
    const fetchLobbies = async () => {
      try {
        // If your endpoint is /lobbies, then:
        const data: Lobby[] = await apiService.get<Lobby[]>("/lobbies");
        setLobbies(data);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Error fetching lobbies:\n${error.message}`);
        } else {
          console.error("An unknown error occurred while fetching lobbies.");
        }
      }
    };

    fetchLobbies();
  }, [apiService]);

  /** Setup columns for the antd table. Adjust as needed. */
  const columns: ColumnsType<Lobby> = [
    {
      title: "Lobby ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Lobby Name",
      dataIndex: "name",
      key: "name",
    },
    // Add more columns for other fields as needed
  ];

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  // Optionally, a function to join or create a lobby
  const handleJoinLobby = (lobbyId: number) => {
    // e.g.: await apiService.post(`/lobbies/${lobbyId}/join`, {...})
    console.log("Joining lobby:", lobbyId);
    // Then push to the game board route or update UI
  };

  // Optionally, a button to create a new lobby
  const handleCreateLobby = async () => {
    // e.g.: const newLobby = await apiService.post("/lobbies", {...})
    console.log("Creating new lobby");
  };

  return (
    <div className="lobbies-container">
      <Card title="Game ID" loading={!lobbies}>
        {lobbies && (
          <>
            <Table
              columns={columns}
              dataSource={lobbies}
              rowKey="id"
              onRow={(lobby) => ({
                onClick: () => handleJoinLobby(lobby.id),
                style: { cursor: "pointer" },
              })}
            />
            <Button onClick={handleCreateLobby} type="primary">
              Create Lobby
            </Button>
            <Button onClick={handleLogout} type="primary" style={{ marginLeft: 8 }}>
              Logout
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
