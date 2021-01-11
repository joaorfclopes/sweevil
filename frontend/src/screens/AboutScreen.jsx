import React, { useState, useEffect } from "react";
import video from "../assets/images/video/video.mp4";
import poster from "../assets/images/video/poster.png";
import { ReactComponent as Play } from "../assets/images/svg/play.svg";

export default function AboutScreen() {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const videoElem = document.getElementById("video");
    const playElem = document.querySelector(".play");
    videoElem.onplay = () => {
      playElem.classList.add("hide");
    };
    videoElem.onpause = () => {
      playElem.classList.remove("hide");
    };
  }, []);

  return (
    <section className="about">
      <div
        className="video"
        onMouseEnter={() => setPlay(true)}
        onMouseLeave={() => setPlay(false)}
      >
        <video id="video" poster={poster} controls={play}>
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="play">
          <Play />
        </div>
      </div>
    </section>
  );
}
