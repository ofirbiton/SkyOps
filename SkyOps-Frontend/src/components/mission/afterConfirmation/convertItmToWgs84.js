import proj4 from "proj4";

proj4.defs("EPSG:2039", "+proj=tmerc +lat_0=31.73439361111111 +lon_0=35.20451694444445 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +towgs84=-48,55,52,0,0,0,0 +units=m +no_defs");
proj4.defs("EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees");

export function convertItmToWgs84(itmPath) {
    if (!Array.isArray(itmPath) || itmPath.length === 0) return [];
    return itmPath.map(({ x, y }) => {
    const [lon, lat] = proj4("EPSG:2039", "EPSG:4326", [x, y]);
    return { latitude: lat, longitude: lon };
    });
}