import React, { useEffect, useState } from "react";
import axios from "axios";
import Video from "../components/Video";
import video from "../assets/video/video.mp4";

export default function AboutScreen(props) {
  const [about, setAbout] = useState({ title: "Who's Sweevil?", body: "" });

  useEffect(() => {
    axios.get("/api/about").then((res) => setAbout(res.data)).catch(() => {});
  }, []);

  const paragraphs = about.body
    ? about.body.split(/\n\n+/).filter(Boolean)
    : [];

  return (
    <section className="about" id="about">
      <div className="row about-container">
        <Video
          videoSrc={video}
          poster={window.location.origin + "/sweevil.jpg"}
          subtitle="produced by João Santana"
        />
        <div className="text">
          <h1 className="title">{about.title}</h1>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <Video
          videoSrc={video}
          poster={window.location.origin + "/sweevil.jpg"}
          subtitle="produced by João Santana"
          mobile
        />
      </div>
    </section>
  );
}
