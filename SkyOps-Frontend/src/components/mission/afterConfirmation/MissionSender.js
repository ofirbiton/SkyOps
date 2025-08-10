// MissionSender.js
export async function sendMission({
  orthoImageUrl,
  streetsImageBlob,
  boundingBox,
  takeoffPixel,   
  landingPixel,
  speed,
  altitude,      
  onSuccess,
  onError,
  setIsSubmitting,
  setIsLoadingRoute,
  navigate,
  skipNavigate = false
}) {
  if (!orthoImageUrl || !streetsImageBlob || !boundingBox) return;

  try {
    setIsSubmitting(true);
    setIsLoadingRoute(true);

    const orthoBlob = await (await fetch(orthoImageUrl)).blob();

    const formData = new FormData();
    formData.append("satellite_image", orthoBlob, "ortho.png");
    formData.append("buildings_image", streetsImageBlob, "streets_with_markers.png");

    const { x1, y1, x2, y2 } = boundingBox;
    const minX = Math.min(x1, x2);      
    const maxX = Math.max(x1, x2);      
    const maxY = Math.max(y1, y2);      
    const minY = Math.min(y1, y2);      

    formData.append("top_left_coord", `(${minX}, ${maxY})`);       
    formData.append("bottom_right_coord", `(${maxX}, ${minY})`);   

    const SERVER_URL = "https://skyops-backend-production-0228.up.railway.app";
    const LOCAL_URL = "http://localhost:5000";
    
    const isLocal = window.location.hostname === "localhost";
    const baseUrl = isLocal ? LOCAL_URL : SERVER_URL;

    const response = await fetch(`${baseUrl}/api/create-mission`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message || "שליחה נכשלה");

    if (!skipNavigate && navigate) {
      navigate("/mission-result", {
        state: {
          imageUrl: result.satelliteImageUrl,
          textFileUrl: result.coordinatesFileUrl,
          takeoffPixel,
          landingPixel,
          speed,
          altitude,
        },
      });
    }

    onSuccess?.();
    setIsSubmitting(false);
    setIsLoadingRoute(false);

    return {
      satelliteImageUrl: result.satelliteImageUrl,
      coordinatesFileUrl: result.coordinatesFileUrl,
    };

  } catch (error) {
    console.error("❌ שגיאה בשליחה לשרת:", error);
    alert("אירעה שגיאה בשליחת המשימה.");
    onError?.();
    setIsSubmitting(false);
    setIsLoadingRoute(false);
  }
}
