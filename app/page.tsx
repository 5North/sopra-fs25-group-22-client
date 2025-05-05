"use client"

import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import styles from "@/styles/page.module.css";

export default function Home() {
  const router = useRouter();

  // Simple neon-blue text color without glow
  const textStyle = {
    color: '#f0f0f0',
  };

  return (
      <div
        className={styles.page}
        style={{
          backgroundImage: 'url(/images/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          fontFamily: 'Roboto, sans-serif',
        }}
      >
        <main
          className={styles.main}
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2rem',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '2x',
          }}
        >
          <h1 style={{ ...textStyle, textAlign: 'center', marginBottom: '1rem' }}>
          Welcome to <strong>Scopa for Beginners</strong>
          </h1>
          <p
            style={{
              ...textStyle,
              fontSize: '1.1rem',
              lineHeight: '1.6',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            A classic Italian card game designed especially
            for beginners. Play the interactive online version with your friends and
            enjoy AI-powered suggestions that guide you through each move, helping you
            learn and master the game with ease. Buon divertimento!
          </p>
          <div
            className={styles.ctas}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              maxWidth: '400px',
              margin: '0 auto',
            }}
          >
            <Button
              type="primary"
              variant="solid"
              onClick={() => router.push("/register")}
            >
              Go to register
            </Button>
            <Button
              type="primary"
              variant="solid"
              onClick={() => router.push("/login")}
            >
              Go to login
            </Button>
          </div>
        </main>
      </div>
  );
}
