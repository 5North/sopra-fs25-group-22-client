"use client"; 

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form } from "antd";
import { logoutUser, getUserById } from "@/api/registerService";
import { createLobby } from "@/api/registerService";
import { message } from "antd";

interface Player {
  username: string;
}


interface UserStats {
  id: number;
  username: string;
  winCount: number;
  lossCount: number;
  tieCount: number;
}


const Home: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { clear: clearToken, value: token} = useLocalStorage<string>("token", ""); 
  const {value: username} = useLocalStorage<string>("username", "");
  const { value: userIdStr} = useLocalStorage<string>("userId", "");
  const userId = Number(userIdStr);
  const [stats, setStats] = useState<Pick<UserStats, "winCount" | "lossCount" | "tieCount">>({
    winCount:  0,
    lossCount: 0,
    tieCount:  0,
  });
  let response: Response;

  // Create lobby 
  const handleStartGame = async () => {            
  
    if (!token) {
      message.error(" Please log in.");
      return;
    }
  
    try {
      const response = await createLobby(token, {});
      if (response.status === 409) {
        message.error("You already have an open lobby. Ask your friend for the Game ID");
        return;
      }
      else if (!response.ok) {
        (
          response.status === 400
            ? "Invalid input or missing data."
            : "Failed to create lobby. Please try again."
        );
        return;
      }
  
      const data = await response.json();
      console.log("Lobby created:", data);
  
      // build the initial players list
      const initialPlayers: Player[] =
        data.players?.length > 0 ? data.players : [];
      if (!initialPlayers.some(p => p.username === username)) {
        initialPlayers.push({ username });
      }

      localStorage.setItem("initialLobby", JSON.stringify({
        ...data,
        players: initialPlayers,
      }));
      localStorage.setItem("Host", username);
  
      router.push(`/lobbies/${data.lobbyId}`);
    } catch (err) {
      console.error("Lobby creation error:", err);
      message.error("An error occurred while creating the lobby.");
    }
  };
    
    useEffect(() => {
      if (!token || !userId) return;
      
      const loadStats = async () => {
        try {
          const response = await getUserById(token, userIdStr);
          if (!response.ok) {
            throw new Error(`Failed to load user: ${response.status}`);
          }
          const dto: UserStats = await response.json();
          setStats({
            winCount:  dto.winCount,
            lossCount: dto.lossCount,
            tieCount:  dto.tieCount,
          });
        } catch (err) {
          console.error("Error fetching stats:", err);
        }
      };
  
      loadStats();
    }, [token, userId, userIdStr]);
    
  
  const handleLogout = async () => {
    try {
      response = await logoutUser(token);
    
      if (!response.ok) {
        throw new Error(`Unexpected error: ${response.status}`);
      }
    
      clearToken();  
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Oopps.. Something went wrong!` + error);  
        console.error(`Something went wrong during the registration:\n${error.message} ${JSON.stringify(error)}`); 
      } else {
        console.error("An unknown error occurred during user registration.");
      }
    }  
  };
  

  return (
    <div className="register-container" style={{ color: "white" }}>
      {/*Full-width title */}
      <h1
        style={{
          textAlign: "center",
          fontSize: "3rem",
          margin: "1rem 0 0.5rem",
        }}
      >
        Scopa for Beginners
      </h1>

      {/* Two-column row under the title */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "10rem",
          marginTop: "1rem",
          padding: "0 2rem 2rem",
        }}
      >
        {/* Left: welcome + stats */}
        <div style={{ flex: 1, maxWidth: "300px",margin: '0 auto', padding: '0.5rem', backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '8px',}}>
          <h2 style={{ fontSize: "1.5rem", margin: 0 , paddingTop: "0.5rem",  lineHeight: 3,}}>
            Welcome back, <strong style={{ color: "#FFA726" }}>{username}</strong>!
          </h2>
          <p>Here are your current stats:</p>
          <ul style={{ listStyle: "none", paddingTop: "0.7rem", fontSize: "1.1rem" }}>
            <li> Wins: {stats.winCount} </li>
            <li>Losses: {stats.lossCount}</li>
            <li> Ties: {stats.tieCount}</li>
          </ul>
        </div>

        {/* Right: form/buttons */}
        <div style={{ flex: 1, maxWidth: "300px" }} className="auth-wrapper">
          <Form
            form={form}
            name="home"
            size="large"
            layout="vertical"
            style={{ width: "100%" }}
          >
            <Form.Item>
              <Button
                className="custom-button"
                onClick={handleStartGame}
              >
                Start a Game
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                className="custom-button"
                onClick={() => router.push("/join")}
              >
                Join a Game
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                className="custom-button"
                onClick={() => router.push("/scoreboard")}
              >
                Scoreboard
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                className="custom-button"
                onClick={() => router.push("/rules")}
              >
                Rules
              </Button>
            </Form.Item>

            <Form.Item style={{ textAlign: "right" }}>
              <Button
                onClick={handleLogout}
                type="primary"
                htmlType="submit"
                className="custom-button"
                style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.5rem",
                  width: "auto",
                  minWidth: "unset",
                }}
              >
                Logout
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Home;
