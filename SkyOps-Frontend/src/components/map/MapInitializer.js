// MapInitializer.js

export default function initializeMap(setScale) {
    window.jQuery(document).ready(function () {
      window.govmap.createMap("map", {
        token: "7f0764a7-7a42-4214-a98b-cb669559d9cb",
        layers: ["contour"],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        background: "2",
        layersMode: 1,
        zoomButtons: false,
        onLoad: () => {
          console.log("GovMap loaded");
          window.govmapReady = true;
        },
      });
  
      window.govmap
        .onEvent(window.govmap.events.EXTENT_CHANGE)
        .progress((e) => {
          if (e?.lod?.scale) {
            setScale(Math.round(e.lod.scale));
          }
        });
    });
  }
  