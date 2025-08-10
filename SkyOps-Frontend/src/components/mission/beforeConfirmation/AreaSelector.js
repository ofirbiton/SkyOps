// AreaSelector.js

export function drawRectangle({
    onRectangleDrawn,
    onInvalidDimensions,
  }) {
    if (!window.govmap) return;
  
    const startDrawing = () => {
      window.govmap.draw(window.govmap.drawType.Rectangle).progress((response) => {
        try {
          const wkt = response?.wkt;
          if (!wkt || !wkt.startsWith("POLYGON")) return;
  
          const coords = wkt
            .replace("POLYGON((", "")
            .replace("))", "")
            .split(",")
            .map((pair) => pair.trim().split(" ").map(Number));
  
          const [x1, y1] = coords[0];
          const [x2, y2] = coords[2];
  
          const width = Math.abs(x2 - x1);
          const height = Math.abs(y2 - y1);
  
          if (width < 100 || height < 100 || width > 1500 || height > 1500) {
            onInvalidDimensions();
            startDrawing();
            return;
          }
  
          onRectangleDrawn({ x1, y1, x2, y2 });
        } catch (err) {
          console.error("שגיאה בבדיקת המלבן:", err);
          alert("אירעה שגיאה.");
        }
      });
    };
  
    startDrawing();
  }