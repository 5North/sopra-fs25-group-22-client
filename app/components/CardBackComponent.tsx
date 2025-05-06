"use client";

import React from "react";

const cardBackStyle: React.CSSProperties = {
  width: "28px",
  height: "42px",
  margin: "2px",
  backgroundImage: "url('/images/cardback.JPG')", 
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "white",
  border:          "2px solid #000080", 
  borderRadius:    "2px",
  boxShadow:       "0 0 8px 2px rgba(65,105,225,0.8)", 
};

interface CardBackProps {
  onClick?: () => void; 
}

const CardBackComponent: React.FC<CardBackProps> = ({ onClick }) => {
  return <div onClick={onClick} style={cardBackStyle}></div>;
};

export default CardBackComponent;
