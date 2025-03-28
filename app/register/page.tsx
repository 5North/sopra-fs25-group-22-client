"use client"; 

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import { useState } from "react";

interface FormFieldProps {
  label: string;
  value: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const {
    set: setToken,
  } = useLocalStorage<string>("token", ""); 

  const [error, setError] = useState("");

  const handleRegister = async (values: FormFieldProps) => {
    try {
      const response = await apiService.post<User>("/users", values);

      if (response.token) {
        setToken(response.token);
      }

      setError("")
      router.push("/login"); // TODO: update to home after home is built..
    } catch (error) {
      if (error instanceof Error) {
        if(error.message.includes("409")) {
          setError("User already exists!"); // TODO: check if you can utilize the error message from the response...
        } else {
          alert(`Oopps.. Something went wrong!`);  
          console.error(`Something went wrong during the registration:\n${error.message} ${JSON.stringify(values)}`);
        }  
      } else {
        console.error("An unknown error occurred during registration.");
      }
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
          <Button type="primary" htmlType="submit" className="custom-button">
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
