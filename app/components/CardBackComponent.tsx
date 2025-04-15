"use client";

import React from "react";

const cardBackStyle: React.CSSProperties = {
  width: "40px",
  height: "60px",
  margin: "4px",
  backgroundImage: "url('/images/cardback.jpg')", // Path to your card back
  backgroundSize: "cover",
  backgroundPosition: "center",
  border: "1px solid #ccc",
  borderRadius: "3px",
};

interface CardBackProps {
  onClick?: () => void;
}

// This component just displays the card back image.
const CardBackComponent: React.FC<CardBackProps> = ({ onClick }) => {
  return <div onClick={onClick} style={cardBackStyle}></div>;
};

export default CardBackComponent;
