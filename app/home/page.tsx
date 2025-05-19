"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form } from "antd";
import { getUserById, logoutUser } from "@/api/registerService";
import { createLobby } from "@/api/registerService";
import { message } from "antd";

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
  const { clear: clearToken, value: token } = useLocalStorage<string>(
    "token",
    "",
  );
  const { clear: clearUsername } = useLocalStorage<string>("username", "");
  const { value: username } = useLocalStorage<string>("username", "");
  const { value: userIdStr } = useLocalStorage<string>("userId", "");
  const { clear: clearUserIdStr } = useLocalStorage<string>("userId", "");
  const userId = Number(userIdStr);
  const [stats, setStats] = useState<
    Pick<UserStats, "winCount" | "lossCount" | "tieCount">
  >({
    winCount: 0,
    lossCount: 0,
    tieCount: 0,
  });
  const [messageApi, contextHolder] = message.useMessage();
  let response: Response;

  // Create lobby
  const handleStartGame = async () => {
    if (!token) {
      message.error(" Please log in.");
      return;
    }

    try {
      // Check if the user already has a lobbyJoined
      const userRes = await getUserById(token, userIdStr);
      if (!userRes.ok) {
        throw new Error(`Failed to load user: ${userRes.status}`);
      }
      const userDto = await userRes.json();

      if (userDto.lobbyJoined !== null) {
        messageApi.open({
          type: "error",
          content: "You’re already in a lobby. Sending you there...",
          style: {
            backgroundColor: "#000",
            color: "#f5222d",
            borderRadius: "4px",
          },
        });

        setTimeout(() => {
          router.push(`/lobbies/${userDto.lobbyJoined}`);
        }, 2000);
        return;
      }

      const lobbyRes = await createLobby(token, {});
      if (lobbyRes.status === 409) {
        return;
      }
      if (!lobbyRes.ok) {
        message.error(
          lobbyRes.status === 400
            ? "Invalid input or missing data."
            : "Failed to create lobby. Please try again.",
        );
        return;
      }

      const lobbyDto = await lobbyRes.json();
      console.log("Lobby created:", lobbyDto);

      router.push(`/lobbies/${lobbyDto.lobbyId}`);
    } catch (err) {
      console.error("Error during start-game:", err);
      message.error(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while starting the game.",
      );
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
          winCount: dto.winCount,
          lossCount: dto.lossCount,
          tieCount: dto.tieCount,
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
      clearUsername();
      clearUserIdStr();
      router.push("/login")
    } catch (error) {
      if (error instanceof Error) {
        alert(`Oopps.. Something went wrong!` + error);
        console.error(
          `Something went wrong during the registration:\n${error.message} ${
            JSON.stringify(error)
          }`,
        );
      } else {
        console.error("An unknown error occurred during user registration.");
      }
    }
  };

  if (!token) {
    return (
      <div
        style={{
          // backgroundImage: 'url("/images/background.jpg")', // Replace with your actual image path
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
        <div
          style={{
            flex: 1,
            maxWidth: "300px",
            margin: "0 auto",
            padding: "0.5rem",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderRadius: "8px",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              margin: 0,
              paddingTop: "0.5rem",
              lineHeight: 1.2, // tighter line spacing for just this line
            }}
          >
            Welcome back,{" "}
            <strong style={{ color: "#FFA726" }}>{username}</strong>!
          </h2>
          <p style={{ marginTop: "2rem" }}>Here are your current stats:</p>
          <ul
            style={{
              listStyle: "none",
              paddingTop: "0.7rem",
              fontSize: "1.1rem",
            }}
          >
            <li>Wins: {stats.winCount}</li>
            <li>Losses: {stats.lossCount}</li>
            <li>Ties: {stats.tieCount}</li>
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
              {contextHolder}
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
