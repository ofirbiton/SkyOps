// ConfirmButtons.jsx
import React from "react";
//import "../Header.css";

export default function ConfirmButtons({ onConfirm, onRedraw }) {
  return (
    <div className="floating-confirm-buttons">
      <button className="primary-button" onClick={onConfirm}>
        אישור גבולות גזרה
      </button>
      <button className="secondary-button" onClick={onRedraw}>
        סימון גבולות גזרה מחדש
      </button>
    </div>
  );
}
