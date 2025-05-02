"use client";

import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form, Input } from "antd";
import { useState } from "react";
import { createUser } from "@/api/registerService";

interface FormFieldProps {
  username: string;
  password: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  const {
    set: setToken,
  } = useLocalStorage<string>("token", "");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  let response: Response;

  const handleRegister = async (values: FormFieldProps) => {
    setLoading(true);
    try {
      response = await createUser(values);
      // TODO: make response check reusable
      if (!response.ok) {
        if (response.status === 409) {
          setError("User already exists!");
        } else {
          throw new Error(`Unexpected error: ${response.status}`);
        }
        return;
      }

      const token = response.headers.get("Token");
      setToken(token ? token : "");
      localStorage.setItem("username", values.username);
      setError("");
      router.push("/home");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Oopps.. Something went wrong!` + error);
        console.error(`Something went wrong during the registration:\n${error.message} ${JSON.stringify(values)}`);
      } else {
        console.error("An unknown error occurred during user registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Form
        form={form}
        // initialValues={{ layout: 'horizontal' }}
        name="register"
        size="large"
        variant="outlined"
        onFinish={handleRegister}
        // layout="horizontal"
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
          <Button type="primary" htmlType="submit" className="custom-button" loading={loading}>
            Register
          </Button>
        </Form.Item>
      </Form>
      <div className="auth-link">
          <Button type="link" onClick={() => router.push("/login")}
          className="register-button-text"
          > Already have an Account? Login
          </Button>
        </div>
    </div>
  );
};

export default Register;
