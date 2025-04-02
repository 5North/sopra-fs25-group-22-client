"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
// import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
// import { User } from "@/types/user";
import { Button, Form } from "antd";

// interface FormFieldProps {
//   label: string;
//   value: string;
// }

const Home: React.FC = () => {
  const router = useRouter();
  // const apiService = useApi();
  const [form] = Form.useForm();

  const {
    clear: clearToken, 
  } = useLocalStorage<string>("token", ""); 

  const handleLogout = async () => {
    // TODO:
    // try {
    //   // Call the API service and let it handle JSON serialization and error handling
    //   const response = await apiService.post<User>("/users", values);

    //   // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
    //   if (response.token) {
    //     clearToken();
    //   }

    //   // Navigate to the user overview
    //   router.push("/users");
    // } catch (error) {
    //   if (error instanceof Error) {
    //     alert(`Something went wrong during the login:\n${error.message}`);
    //   } else {
    //     console.error("An unknown error occurred during login.");
    //   }
    // }
    // TODO: Call logout
    clearToken();
    router.push("/login");
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
              onClick={() => router.push("/lobbies/start")}
            >
              Start a Game
            </Button>
          </Form.Item>
  
          <Form.Item>
            <Button
              className="custom-button"
              onClick={() => router.push("/lobbies/join")}
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
              htmlType="button"
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
