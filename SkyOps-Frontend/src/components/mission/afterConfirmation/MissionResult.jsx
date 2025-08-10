// MissionResult.jsx
//src/components/mission/afterConfirmation/MissionResult.jsx

import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../MissionHeader";
import { convertItmToWgs84 } from "./convertItmToWgs84";
import { generateLitchiCsv } from "./generateLitchiCsv";

export default function MissionResult() {
  /* MissionSender reciever */
  const { state } = useLocation();
  const navigate = useNavigate();
  const { imageUrl, textFileUrl, speed = 8, altitude = 6 } = state || {};

  /*  state  */
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const imgRef = useRef(null);

  /* CSV to Litchi*/
  const downloadLitchiCsv = async () => {
    if (!textFileUrl) return;
    try {
      const resp = await fetch(textFileUrl);
      const json = await resp.json();
      const itmPath = json.path;
      const wgs84Path = convertItmToWgs84(itmPath);
      const csvText = generateLitchiCsv(wgs84Path, altitude, speed);
      const blob = new Blob([csvText], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mission.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("שגיאה בהורדת CSV ל‑Litchi:", err);
      alert("לא ניתן ליצור קובץ Litchi. בדוק את החיבור או את קובץ הקואורדינטות.");
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Header
        taskMode={true}
        hideDrawButton={true}
        onToggleTaskMode={() => {
          navigate("/");
          window.location.reload(); 
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {imageUrl && (
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "80vh",
              overflow: "hidden", 
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          >
            <img
              src={imageUrl}
              alt="תמונת מסלול"
              onLoad={(e) =>
                setNaturalSize({
                  w: e.target.naturalWidth,
                  h: e.target.naturalHeight,
                })
              }
              style={{
                display: "block",
                width: "100%",    
                height: "100%",  
                objectFit: "contain",
              }}
            />
          </div>
        )}

        {textFileUrl && (
          <div style={{ marginTop: 24 }}>
            <button className="primary-button" onClick={downloadLitchiCsv}>
              הורד מסלול
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
