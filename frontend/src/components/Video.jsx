import React, { useState, useEffect } from "react";
import $ from "jquery";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Placeholder from "../components/Placeholder";
import { ReactComponent as Play } from "../assets/svg/play.svg";

export default function Video(props) {
  const [play, setPlay] = useState(false);
  const [hidePlaceholder, setHidePlaceholder] = useState(false);

  const videoLoaded = () => {
    $(".video-desktop").addClass("show");
    $(".video-mobile").addClass("show");
    $(".video-subtitle").addClass("show");
    $(".play").addClass("show");
    setHidePlaceholder(true);
  };

  useEffect(() => {
    const videoElem = document.getElementById("video");
    videoElem.onplay = () => {
      $(".play").addClass("hide");
      $(".play").removeClass("show");
    };
    videoElem.onpause = () => {
      $(".play").addClass("show");
      $(".play").removeClass("hide");
    };
    videoElem.onended = () => {
      videoElem.pause();
      videoElem.removeAttribute("src");
      videoElem.load();
    };
  }, []);

  return (
    <div className={`video ${props.mobile ? "mobile" : "desktop"}`}>
      <Placeholder height="100%">
        <video
          id="video"
          className={`video-${props.mobile ? "mobile" : "desktop"}`}
          poster={props.poster}
          controls={play}
          onMouseEnter={() => setPlay(true)}
          onMouseLeave={() => setPlay(false)}
        >
          <source src={props.videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="play">
          <Play />
        </div>
        <div className="poster">
          <LazyLoadImage src={props.poster} afterLoad={videoLoaded} />
        </div>
      </Placeholder>
      <div className="video-subtitle-container">
        <Placeholder height="100%" text hide={hidePlaceholder}>
          <p className="video-subtitle">{props.subtitle}</p>
        </Placeholder>
      </div>
    </div>
  );
}
