// LoadingOverlay.jsx
import React from "react";

export default function LoadingOverlay() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(255,255,255,0.8)",
      zIndex: 5000,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "2rem",
      fontWeight: "bold",
      color: "#007bff"
    }}>
      ...המסלול בהכנה
      <div style={{
        marginTop: 20,
        width: 40,
        height: 40,
        border: "5px solid #f3f3f3",
        borderTop: "5px solid #007bff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <style>
        {`@keyframes spin { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}
