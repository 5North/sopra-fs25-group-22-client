"use client";

import React from "react";
import Image from 'next/image';
import { Tooltip } from "antd";


interface CardProps {
  card: { suit: string; value: number };
  onClick?: () => void;
  borderColor?: string;
  glowColor?: string;
}

const suitMap: Record<string,string> = {
  DENARI:  "diamond",  
  COPPE:   "heart",
  BASTONI: "spade",
  SPADE:   "club",
};

function valueMap(v: number): string {
  if (v >= 1 && v <= 7) return String(v);
  if (v === 8)        return "jack";
  if (v === 9)        return "queen";
  if (v === 10)       return "king";
  throw new Error("Unknown card value: " + v);
}

function valueMapExplain(v: number): string {
  if (v >= 1 && v <= 10) return String(v);
  throw new Error("Unknown card value: " + v);
}

const CardComponent: React.FC<CardProps> = ({ card, onClick }) => {
  const id       = `${valueMap(card.value)}_${suitMap[card.suit]}`;  
  const src      = `/cards/${id}.svg`;                             
  const tooltip = `${valueMapExplain(card.value)} of ${card.suit.toLowerCase()}`


  return (
    <Tooltip title={tooltip} placement="top" >
      <div onClick={onClick} style={cardStyle}>
        <Image
          src={src}
          width={60}
          height={90}
          alt={tooltip}
          style={{
            display: "block",
            objectFit: "contain",
            filter: "contrast(5) saturate(1)",
            backgroundColor: "#ccc",
          }}
        />
      </div>
    </Tooltip>
  );
};

const cardStyle: React.CSSProperties = {
  width:           "60px",
  height:          "90px",
  margin:          "4px",
  padding:         0,
  backgroundColor: "white",
  border:          "2px solid #FFA500",
  borderRadius:    "4px",
  boxShadow:       "0 0 8px 2px rgba(255,165,0,0.8)",
  textAlign:       "center",
  cursor:          "pointer",
};



export default CardComponent;
