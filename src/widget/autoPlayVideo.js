import React, { useEffect, useRef } from "react";

const AutoPlayVideo = ({ videoSource }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        // Auto-play may be blocked by the browser
        console.error("Auto-play failed:", error);
      });
    }
  }, []);

  return (
    <video ref={videoRef} controls className="autoplay-video">
      <source src={videoSource} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default AutoPlayVideo;
