export function generateLitchiCsv(pathWgs84, altitude = 6, speed = 8) {
  const headers = [
    "latitude","longitude","altitude(m)","heading(deg)","curvesize(m)","rotationdir",
    "gimbalmode","gimbalpitchangle","altitudemode","speed(m/s)",
    "poi_latitude","poi_longitude","poi_altitude(m)","poi_altitudemode",
    "photo_timeinterval","photo_distinterval",
  ];
  
  const lastIdx = pathWgs84.length - 1;

  const rows = pathWgs84.map(({ latitude, longitude }, idx) => {
    const poiLat = idx < lastIdx ? pathWgs84[idx + 1].latitude  : 0;
    const poiLon = idx < lastIdx ? pathWgs84[idx + 1].longitude : 0;

    return [
      latitude.toFixed(8),
      longitude.toFixed(8),
      altitude,                    
      -1,
      idx === 0 || idx === lastIdx ? 0.2 : 108,
      0, 0, 0, 0,
      speed,                        
      poiLat ? poiLat.toFixed(8) : 0,
      poiLon ? poiLon.toFixed(8) : 0,
      0, 0,
      -1, -1
    ];
  });

  return [headers.join(","), ...rows.map(r=>r.join(","))].join("\n");
}
