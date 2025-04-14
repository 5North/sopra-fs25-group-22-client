"use client";

import React from "react";

function getSuitSymbol(suit: string) {
  switch (suit) {
    case "DENARI":
      return "♦"; // You can also replace with an image if needed.
    case "COPPE":
      return "♥";
    case "BASTONI":
      return "♣";
    case "SPADE":
      return "♠";
    default:
      return "?";
  }
}

interface CardProps {
  card: { suit: string; value: number };
  onClick?: () => void;
}

const CardComponent: React.FC<CardProps> = ({ card, onClick }) => {
  return (
    <div onClick={onClick} style={cardStyle}>
      <div style={{ fontSize: "1.2rem" }}>{card.value}</div>
      <div style={{ fontSize: "1.2rem" }}>{getSuitSymbol(card.suit)}</div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  width: "40px",
  height: "60px",
  margin: "4px",
  padding: "4px",
  backgroundColor: "white",
  color: "black", 
  border: "1px solid #ccc",
  borderRadius: "3px",
  textAlign: "center",
  cursor: "pointer",
};

export default CardComponent;
