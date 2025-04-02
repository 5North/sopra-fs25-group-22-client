"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form } from "antd";
import { logoutUser } from "@/api/registerService";

const Home: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  const {
    clear: clearToken, 
    value: token
  } = useLocalStorage<string>("token", ""); 

  let response: Response;
  
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
    <div className="login-container">
      <div className="auth-wrapper">
        <h1 style={{ color: "white", textAlign: "center", marginBottom: "1.5rem" }}>
          Scopa for Beginners
        </h1>
  
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
              onClick={() => router.push("/lobbies")}
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
              style={{ fontSize: "0.75rem", padding: "0.25rem 1rem" }}
            >
              Logout
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
  

export default Home;
