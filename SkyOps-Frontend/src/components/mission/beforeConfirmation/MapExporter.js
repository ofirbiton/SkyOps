// MapExporter.js

export function createExportUrls({ x1, y1, x2, y2 }) {
    const xMin = Math.min(x1, x2);
    const xMax = Math.max(x1, x2);
    const yMin = Math.min(y1, y2);
    const yMax = Math.max(y1, y2);
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
  
    const extentParam = encodeURIComponent(
      JSON.stringify({
        spatialReference: { wkid: 2039 },
        xmin: xMin,
        ymin: yMin,
        xmax: xMax,
        ymax: yMax,
      })
    );
  
    const baseUrl = "https://ags.govmap.gov.il/ExportMap/ExportMap";
    const sharedParams = `?CenterX=${centerX}&CenterY=${centerY}` +
      `&sExtent=${extentParam}` +
      `&Level=9&Resolution=0.661459656252646&Scale=2500` +
      `&VisibleLayers={}&DefinitionExp={}&AddMapiLogo=true`;
  
    const urlStreets = `${baseUrl}${sharedParams}&IsSharedBg=false&VisibleBg=[\"MapCacheNational\"]`;
    const urlOrtho = `${baseUrl}${sharedParams}&IsSharedBg=true&VisibleBg=[19]`;
  
    return { urlOrtho, urlStreets };
  }