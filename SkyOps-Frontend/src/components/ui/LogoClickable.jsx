// LogoClickable.jsx
import React from "react";
import logo from "../../Images/skyops logo.png";
//import "../Header.css";

export default function LogoClickable({ onClick }) {
  return (
    <div className="logo" onClick={onClick} style={{ cursor: "pointer" }}>
      <img src={logo} alt="SkyOps Logo" className="logo-img" />
    </div>
  );
}
