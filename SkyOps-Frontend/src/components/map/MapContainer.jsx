// MapContainer.jsx
import React, { useEffect, useRef, useState } from "react";
//import "../MapContainer.css";
import initializeMap from "./MapInitializer";
import ScaleBox from "./ScaleBox";

export default function MapContainer() {
  const [scale, setScale] = useState(null);
  const isInit = useRef(false);

  useEffect(() => {
    if (!isInit.current) {
      initializeMap(setScale);
      isInit.current = true;
    }
  }, []);

  return (
    <>
      {scale && <ScaleBox scale={scale} />}
      <div id="map" className="map-container"></div>
    </>
  );
}
