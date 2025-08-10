// ScaleBox.jsx
import React from "react";
//import "../MapContainer.css";

export default function ScaleBox({ scale }) {
  return (
    <div className="scale-box">
      1:{scale.toLocaleString()}
    </div>
  );
}
