"use client";

import React, { useState } from "react";
import Image from "next/image";

interface CardProps {
  card: { suit: string; value: number };
  onClick?: () => void;
  borderColor?: string;
  glowColor?: string;
}

const suitMap: Record<string, string> = {
  DENARI: "diamond",
  COPPE: "heart",
  BASTONI: "spade",
  SPADE: "club",
};

function valueMap(v: number): string {
  if (v >= 1 && v <= 7) return String(v);
  if (v === 8) return "jack";
  if (v === 9) return "queen";
  if (v === 10) return "king";
  throw new Error("Unknown card value: " + v);
}

const CardComponent: React.FC<CardProps> = ({ card, onClick }) => {
  const [hovered, setHovered] = useState(false);

  const id = `${valueMap(card.value)}_${suitMap[card.suit]}`;
  const src = `/cards/${id}.svg`;
  const altText = `${card.value} of ${card.suit}`;

  return (
    <div
      onClick={onClick}
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div style={tooltipStyle}>
          {altText}
        </div>
      )}
      <Image
        src={src}
        width={60}
        height={90}
        alt={altText}
        style={{
          display: "block",
          // Ensure the entire SVG is visible without clipping
          objectFit: "contain",
          objectPosition: "center",
          // Match panel styling:
          backgroundColor: "#fff",
          padding: "0.25rem", // inner padding like panel
          borderRadius: "4px", // rounded corners
          filter: "contrast(1) saturate(1)",
        }}
      />
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  width: "60px",
  height: "90px",
  margin: "4px",
  padding: 0,
  backgroundColor: "white",
  border: "2px solid #FFA500",
  borderRadius: "4px",
  boxShadow: "0 0 8px 2px rgba(255,165,0,0.8)",
  textAlign: "center",
  cursor: "pointer",
};

const tooltipStyle: React.CSSProperties = {
  position: "absolute",
  top: "-32px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "#000c",
  color: "#0ff",
  padding: "6px 10px",
  border: "1px solid #0ff", // Thinner border
  borderRadius: "8px",
  fontSize: "12px",
  whiteSpace: "nowrap",
  boxShadow:
    "0 0 3px rgba(133, 251, 255, 0.6), 0 0 6px rgba(133, 251, 255, 0.4)", // Softer glow
  zIndex: 1000,
  pointerEvents: "none",
};

export default CardComponent;
