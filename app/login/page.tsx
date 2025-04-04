"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form, Input } from "antd";
import { useState } from "react";
import { login } from "@/api/registerService";

interface FormFieldProps {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const {
    set: setToken, 
    // clear: clearToken, // is commented out because we do not need to clear the token when logging in
  } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
  const[error, setError] = useState("")

  const handleLogin = async (values: FormFieldProps) => {
    try {
      const response = await login(values);

    if (!response.ok) {
      if (response.status === 403) {
        setError("Invalid username or password!");
      } else {
        throw new Error(`Unexpected error: ${response.status}`);
      }
      return;
    }

    const token = response.headers.get("Token");

    if (!token) {
      throw new Error("No token returned from server.");
    }

    setToken(token); 
    localStorage.setItem("username", values.username); 
    setError("");
    router.push("/home");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("403")) {
        setError("Invalid username or password!");
      } else {
        alert("Something went wrong" + error);
        console.error(`An unknown error occurred during login.\n${error.message} ${JSON.stringify(values)}`);  
      }
    }
    else {
      console.error("An unknown error occurred during login");
    }
  }
};

    

  return (
    <div className="register-container">
      <div className="auth-wrapper">
        <Form
          form={form}
          name="login"
          size="large"
          variant="outlined"
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter your username!" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item>
          {error && <p style={{ color: "red" }}>{error}</p>}
            <Button type="primary" htmlType="submit" className="custom-button">
            ♣️ Login
            </Button>
          </Form.Item>
        </Form>
        <div className="auth-link">
          <Button type="link" onClick={() => router.push("/register")}>
            New here? Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
