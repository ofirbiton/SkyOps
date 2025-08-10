// src/components/mission/MissionPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MapContainer from "../map/MapContainer";
import MissionHeader from "./MissionHeader";
import TakeoffLandingSelector from "./afterConfirmation/TakeoffLandingSelector";
import LoadingOverlay from "./afterConfirmation/LoadingOverlay";
import { createExportUrls } from "./beforeConfirmation/MapExporter";
import { drawPixelsOnImage } from "./afterConfirmation/ImagePixelEditor";
import { sendMission } from "./afterConfirmation/MissionSender";
import proj4 from "proj4";
import { drawPolygonsOnImage } from "./afterConfirmation/ImagePixelEditor";

// EPSG definitions
const PROJ_WGS84 = "EPSG:4326";
const PROJ_ITM =
  "+proj=tmerc +lat_0=31.73439361111111 +lon_0=35.20451694444445 " +
  "+k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +units=m +no_defs";

const pixelToITM = (px, py, bbox, imgW, imgH) => {
  const xmin = Math.min(bbox.x1, bbox.x2);
  const xmax = Math.max(bbox.x1, bbox.x2);
  const ymin = Math.min(bbox.y1, bbox.y2);
  const ymax = Math.max(bbox.y1, bbox.y2);
  const xITM = xmin + (px * (xmax - xmin)) / imgW;
  const yITM = ymax - (py * (ymax - ymin)) / imgH;
  return [xITM, yITM];
};

const isPointInPolygon = ({ x, y }, polyPx) => {
  let inside = false;
  for (let i = 0, j = polyPx.length - 1; i < polyPx.length; j = i++) {
    const xi = polyPx[i].x, yi = polyPx[i].y;
    const xj = polyPx[j].x, yj = polyPx[j].y;
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export default function MissionPage() {
  /* ---------- state hooks ---------- */
  const [taskMode, setTaskMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pendingRectangle, setPendingRectangle] = useState(null);
  const [boundingBox, setBoundingBox] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [orthoImageUrl, setOrthoImageUrl] = useState(null);
  const [streetsImageUrl, setStreetsImageUrl] = useState(null);
  const [takeoffPixel, setTakeoffPixel] = useState(null);
  const [landingPixel, setLandingPixel] = useState(null);
  const [clickStage, setClickStage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [serverResult,  setServerResult]   = useState(null);
  const [noFlyPolygons, setNoFlyPolygons] = useState([]); 
  const [isDrawingNoFly, setIsDrawingNoFly] = useState(false); 
  const [currentPoly,   setCurrentPoly]    = useState([]);    
  const [showSpeedAlt, setShowSpeedAlt] = useState(false);      
  const [speed,    setSpeed]    = useState(8);                  
  const [altitude, setAltitude] = useState(6);                  
  const imageRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!showSpeedAlt && serverResult) {
      navigate("/mission-result", {
        state: {
          imageUrl: serverResult.satelliteImageUrl,
          textFileUrl: serverResult.coordinatesFileUrl,
          takeoffPixel,
          landingPixel,
          speed,
          altitude,
        },
      });
    }
  }, [
    showSpeedAlt,        
    serverResult,        
    navigate,
    takeoffPixel,
    landingPixel,
    speed,
    altitude,
  ]);

  /* ---------- helper ---------- */
  const safeClearDrawings = () => {
    if (window.govmapReady && typeof window.govmap.clearDrawings === "function") {
      try {
        window.govmap.clearDrawings();
      } catch (_) {}
    }
  };

  /* ---------- reset & home ---------- */
  const handleResetAndGoHome = () => {
    setIsSubmitting(false);
    safeClearDrawings();
    setPendingRectangle(null);
    setSearchText("");
    setHasDrawn(false);
    setOrthoImageUrl(null);
    setStreetsImageUrl(null);
    setClickStage(null);
    setTakeoffPixel(null);
    setLandingPixel(null);
    setBoundingBox(null);
    setTaskMode(false);
    navigate("/");
  };

  const handleToggleTaskMode = () =>
    taskMode ? handleResetAndGoHome() : (navigate("/"), setTaskMode(true));

  /* ---------- draw rectangle ---------- */
  const handleDrawRectangle = () => {
    if (!window.govmap) return;

    const startDrawing = () => {
      setPendingRectangle(null);
      setHasDrawn(true);

      window.govmap
        .draw(window.govmap.drawType.Rectangle)
        .progress((res) => {
          try {
            const wkt = res?.wkt;
            if (!wkt?.startsWith("POLYGON")) return;

            const coords = wkt
              .replace("POLYGON((", "")
              .replace("))", "")
              .split(",")
              .map((p) => p.trim().split(" ").map(Number));

            const [x1, y1] = coords[0];
            const [x2, y2] = coords[2];
            const width = Math.abs(x2 - x1);
            const height = Math.abs(y2 - y1);

            if (width < 100 || height < 100 || width > 1500 || height > 1500) {
              alert("⚠️ מימדי המלבן לא חוקיים. נסה/י שוב.");
              startDrawing();
              return;
            }

            setPendingRectangle({ x1, y1, x2, y2 });
            setBoundingBox({ x1, y1, x2, y2 });

            window.govmap.zoomToXY({
              x: (x1 + x2) / 2,
              y: (y1 + y2) / 2,
              level: 9,
              marker: false,
            });
          } catch (err) {
            console.error("שגיאה בבדיקת המלבן:", err);
            alert("אירעה שגיאה.");
          }
        });
    };

    startDrawing();
  };

  /* ---------- confirm rectangle ---------- */
  const handleConfirmArea = () => {
    if (!boundingBox) return;
    const { urlOrtho, urlStreets } = createExportUrls(boundingBox);
    setOrthoImageUrl(urlOrtho);
    setStreetsImageUrl(urlStreets);
    setPendingRectangle(null);
    setClickStage("takeoff");
  };

  /* ---------- start/cancel No-Fly drawing ---------- */
  const startNoFlyDraw = () => {
    setIsDrawingNoFly((prev) => !prev); 
    setCurrentPoly([]);                
  };

  const finishNoFlyDraw = () => {
    if (!isDrawingNoFly || currentPoly.length < 3 || !boundingBox) return;

    if (
      isPointInPolygon(takeoffPixel, currentPoly) ||
      isPointInPolygon(landingPixel, currentPoly)
    ) {
      alert("לא ניתן לקבוע אזור אסור לטיסה על נקודת ההמראהה או הנחיתה");
      setIsDrawingNoFly(false);
      setCurrentPoly([]);
      return;
    }

    const polyITM = currentPoly.map(({ x, y }) =>
      pixelToITM(
        x,
        y,
        boundingBox,
        imageRef.current.naturalWidth,
        imageRef.current.naturalHeight
      )
    );
    setNoFlyPolygons((prev) => [...prev, polyITM]);
    setIsDrawingNoFly(false);
    setCurrentPoly([]);
  };


  const removeNoFly = (idx) => {
    setNoFlyPolygons((prev) => prev.filter((_, i) => i !== idx));
  };
  
  /* ---------- search ---------- */
  const handleSearch = async () => {
    if (!searchText.trim()) return;
    try {
      const resp = await window.govmap.geocode({
        keyword: searchText,
        type: window.govmap.geocodeType.AccuracyOnly,
      });
      if (resp?.data?.[0]?.ResultType === 1) {
        const { X, Y } = resp.data[0];
        window.govmap.zoomToXY({ x: X, y: Y, level: 6 });
      } else {
        alert("לא נמצאה תוצאה מדויקת.");
      }
    } catch (err) {
      console.error("שגיאת חיפוש:", err);
      alert("שגיאה בביצוע החיפוש.");
    }
  };

  /* ---------- locate me ---------- */
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("הדפדפן אינו תומך בשירותי מיקום.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        // reject inaccurate location (>100 m)
        if (accuracy > 100) {
          alert("המיקום לא מדויק מספיק (דיוק גדול מ-100 מ').");
          return;
        }

        if (!window.govmapReady || !window.govmap) {
          alert("המפה עדיין בטעינה – נסה/י שוב בעוד שניות אחדות.");
          return;
        }

        /* convert via GovMap */
        let itm = null;
        if (typeof window.govmap.convertWGS84ToITM === "function") {
          itm = window.govmap.convertWGS84ToITM({ lat: latitude, lon: longitude });
        } else if (
          typeof window.govmap.convert === "function" &&
          window.govmap.CoordsWGS84 &&
          window.govmap.CoordsITM
        ) {
          itm = window.govmap.convert(
            { lat: latitude, lon: longitude },
            window.govmap.CoordsWGS84,
            window.govmap.CoordsITM
          );
        }

        /* fallback – proj4 */
        if (!itm?.x && !itm?.X) {
          try {
            const [x, y] = proj4(PROJ_WGS84, PROJ_ITM, [longitude, latitude]);
            itm = { x, y };
          } catch (e) {
            console.error("proj4 error:", e);
          }
        }

        const xVal = itm?.x ?? itm?.X;
        const yVal = itm?.y ?? itm?.Y;

        if (
          typeof xVal === "number" &&
          typeof yVal === "number" &&
          !isNaN(xVal) &&
          !isNaN(yVal)
        ) {
          window.govmap.zoomToXY({ x: xVal, y: yVal, level: 6, marker: true });
        } else {
          alert("לא ניתן להמיר קואורדינטות – נסה שוב מאוחר יותר.");
        }
      },
      (err) => {
        console.error("geolocation error:", err);
        alert("לא ניתן לקבל מיקום מהמכשיר.");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  /* ---------- handle image click ---------- */
  const handleImageClick = (e) => {
    if (!imageRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    if (clickStage === "takeoff") setTakeoffPixel({ x, y });
    else if (clickStage === "landing") setLandingPixel({ x, y });
    if (isDrawingNoFly) {
      setCurrentPoly((prev) => [...prev, { x, y }]); 
      return;
    }
  };

  /* ---------- send mission ---------- */
  const handleSendMission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsLoadingRoute(true);
    try {
      const streetsBlob = await drawPixelsOnImage(
        streetsImageUrl,
        takeoffPixel,
        landingPixel,
        noFlyPolygons,  
        boundingBox     
      );
      const orthoBlobWithPolys = await drawPolygonsOnImage(
        orthoImageUrl,
        noFlyPolygons,
        boundingBox,
        takeoffPixel,
        landingPixel
      );
      const orthoOverlayUrl = URL.createObjectURL(orthoBlobWithPolys);

      await sendMission({
        orthoImageUrl: orthoOverlayUrl, 
        streetsImageBlob: streetsBlob,  
        boundingBox,
        takeoffPixel,
        landingPixel,
        noFlyPolygons,                 
        speed,          
        altitude,       
        navigate,
        setIsSubmitting,
        setIsLoadingRoute,
      });

    } catch (err) {
      console.error("❌ שגיאה בשליחה:", err);
      alert("אירעה שגיאה בשליחת המשימה.");
      setIsSubmitting(false);
      setIsLoadingRoute(false);
    }
  };

  /* ---------- render ---------- */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <MissionHeader
        taskMode={taskMode}
        searchText={searchText}
        setSearchText={setSearchText}
        onSearch={handleSearch}
        onLocateMe={handleLocateMe}
        onToggleTaskMode={handleToggleTaskMode}
        hasDrawn={hasDrawn}
        onDrawRectangle={handleDrawRectangle}
        pendingRectangle={pendingRectangle}
        onConfirmArea={handleConfirmArea}
      />

      <div style={{ flex: 1, overflow: "hidden" }}>
        <MapContainer />
        {showSpeedAlt && (
          <div style={{
                position:'fixed', inset:0, background:'#fff',
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                zIndex:10000
          }}>
            <label style={{fontWeight:'bold'}}>מהירות (מטר/שנייה): {speed}</label>
            <input type="range" min={1} max={15} value={speed}
                  onChange={e=>setSpeed(+e.target.value)} style={{width:280}} />

            <label style={{fontWeight:'bold', marginTop:24}}>
                גובה (מטר): {altitude}
            </label>
            <input type="range" min={2} max={50} value={altitude}
                  onChange={e=>setAltitude(+e.target.value)} style={{width:280}} />

            <button className="primary-button" style={{marginTop:32}}
              onClick={() => {
                setIsLoadingRoute(true);
                setShowSpeedAlt(false);
              }}>
              אשר מהירות וגובה
            </button>
          </div>
        )}
        {orthoImageUrl && (
          <TakeoffLandingSelector
            imageUrl={orthoImageUrl}
            clickStage={clickStage}
            takeoffPixel={takeoffPixel}
            landingPixel={landingPixel}
            mousePosition={mousePosition}
            onImageClick={handleImageClick}
            onMouseMove={(e) =>
              setMousePosition({
                x: e.nativeEvent.offsetX,
                y: e.nativeEvent.offsetY,
              })
            }
            onApproveTakeoff={() => setClickStage("landing")}
            onApproveLanding={() => setClickStage("done")}
            onImageDoubleClick={finishNoFlyDraw}
            onAddNoFlyZone={startNoFlyDraw}
            noFlyCount={noFlyPolygons.length}
            currentPoly={currentPoly}
            onRemoveNoFly={removeNoFly}
            noFlyPolygons={noFlyPolygons}
            boundingBox={boundingBox}
            isDrawingNoFly={isDrawingNoFly}
            
            onSendMission={() => {
              setShowSpeedAlt(true);        

              if (!serverResult && !isSubmitting) {
                (async () => {
                  try {
                    const streetsBlob = await drawPixelsOnImage(
                      streetsImageUrl,
                      takeoffPixel,
                      landingPixel,
                      noFlyPolygons,
                      boundingBox
                    );

                    const orthoBlobWithPolys = await drawPolygonsOnImage(
                      orthoImageUrl,
                      noFlyPolygons,
                      boundingBox,
                      takeoffPixel,
                      landingPixel
                    );
                    const orthoOverlayUrl = URL.createObjectURL(orthoBlobWithPolys);

                    const res = await sendMission({
                      orthoImageUrl: orthoOverlayUrl,
                      streetsImageBlob: streetsBlob,
                      boundingBox,
                      takeoffPixel,
                      landingPixel,
                      noFlyPolygons,
                      speed,
                      altitude,
                      navigate,          
                      setIsSubmitting,
                      setIsLoadingRoute,
                      skipNavigate: true
                    });
                    setServerResult(res);   
                  } catch (_) {/**/ }
                })();
              }
            }}
            imageRef={imageRef}
          />
        )}

        {isLoadingRoute && !showSpeedAlt && <LoadingOverlay />}
      </div>
    </div>
  );
}
