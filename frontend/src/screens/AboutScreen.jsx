import React from "react";
import video from "../assets/images/video/video.mp4";
import poster from "../assets/images/video/poster.png";

export default function AboutScreen() {
  return (
    <section className="about">
      <div className="video">
        <video id="video" poster={poster} controls>
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
}
