import React from "react";
import { Player } from "video-react";
import video from "../assets/images/video/video.mov";
import poster from "../assets/images/video/poster.png";

export default function AboutScreen() {
  return (
    <section className="about">
      <div className="video">
        <Player playsInline poster={poster} src={video} />
      </div>
    </section>
  );
}
