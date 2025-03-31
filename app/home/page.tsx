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
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleLogout}
        layout="vertical"
      >
        <Form.Item>
          <Button 
            type="primary" htmlType="submit" className="custom-button">
            Logout
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Home;
