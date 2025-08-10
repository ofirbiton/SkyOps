// useMissionState.js
import { useState, useRef } from "react";

export default function useMissionState() {
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

  const imageRef = useRef();

  return {
    searchText,
    setSearchText,
    pendingRectangle,
    setPendingRectangle,
    boundingBox,
    setBoundingBox,
    hasDrawn,
    setHasDrawn,
    orthoImageUrl,
    setOrthoImageUrl,
    streetsImageUrl,
    setStreetsImageUrl,
    takeoffPixel,
    setTakeoffPixel,
    landingPixel,
    setLandingPixel,
    clickStage,
    setClickStage,
    isSubmitting,
    setIsSubmitting,
    mousePosition,
    setMousePosition,
    isLoadingRoute,
    setIsLoadingRoute,
    imageRef
  };
}