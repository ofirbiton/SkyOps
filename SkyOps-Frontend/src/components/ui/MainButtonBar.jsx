// MainButtonBar.jsx
import React from "react";
//import "../Header.css";

export default function MainButtonBar({ taskMode, onToggleTaskMode, onDrawRectangle, showDrawButton }) {
  return (
    <div className="button-bar">
      <button
        className={`primary-button ${taskMode ? "cancel-button" : ""}`}
        onClick={onToggleTaskMode}
      >
        {taskMode ? "ביטול משימה" : "יצירת משימה חדשה"}
      </button>

      {taskMode && showDrawButton && (
        <button className="secondary-button" onClick={onDrawRectangle}>
          סימון גבולות גזרה
        </button>
      )}
    </div>
  );
}
