// MissionHeader.jsx
import React from "react";
import logo from "../../Images/skyops logo.png";

export default function MissionHeader({
  taskMode,
  searchText,
  setSearchText,
  onSearch,
  onLocateMe,          
  onToggleTaskMode,
  hasDrawn,
  onDrawRectangle,
  pendingRectangle,
  onConfirmArea,
  hideDrawButton       
}) {
  const handleLogoClick = () => {
    if (taskMode) onToggleTaskMode();
  };

  return (
    <div className="header">
      <div
        className="search-container"
        style={{ justifyContent: taskMode ? "flex-start" : "space-between" }}
      >
        {!taskMode && (
          <>
            <input
              type="text"
              className="search-input"
              placeholder="חפש כתובת"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button className="secondary-button" onClick={onSearch}>
              חפש
            </button>
            <button
              className="secondary-button"
              onClick={() => window.govmap?.showMeasure()}
            >
              הפעל מדידה
            </button>
            <button className="secondary-button" onClick={onLocateMe}>
              המיקום שלי
            </button>
          </>
        )}

        <div className="button-bar">
          <button
            className={`primary-button ${taskMode ? "cancel-button" : ""}`}
            onClick={onToggleTaskMode}
          >
            {taskMode ? "ביטול משימה" : "יצירת משימה חדשה"}
          </button>

          {taskMode && !hasDrawn && !hideDrawButton && (
            <button className="secondary-button" onClick={onDrawRectangle}>
              סימון גבולות גזרה
            </button>
          )}
        </div>
      </div>

      <div className="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
        <img src={logo} alt="SkyOps Logo" className="logo-img" />
      </div>

      {pendingRectangle && (
        <div className="floating-confirm-buttons">
          <button className="primary-button" onClick={onConfirmArea}>
            אישור גבולות גזרה
          </button>
          <button className="secondary-button" onClick={onDrawRectangle}>
            סימון גבולות גזרה מחדש
          </button>
        </div>
      )}
    </div>
  );
}
