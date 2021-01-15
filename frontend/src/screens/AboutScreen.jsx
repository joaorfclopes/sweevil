import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import video from "../assets/images/video/video.mp4";
import poster from "../assets/images/video/poster.jpg";
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
    videoElem.onended = () => {
      videoElem.pause();
      videoElem.removeAttribute("src");
      videoElem.load();
    };
  }, []);

  return (
    <motion.section
      className="about"
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="row" style={{ minHeight: "70vh" }}>
        <div className="container">
          <div className="row-bootstrap">
            <div className="col-md-5">
              <h1 className="brushstrikeregular">Who's Sweevil ?</h1>
              <p>
                Sílvia Peralta is a multi-disciplinary artist from Portugal born
                in 1992.
              </p>
              <p>
                In 2013 after finishing a BfA in Design studies in Porto she
                started tattooing independently.
              </p>
              <p>
                As a tattoo artist she specialized in blackwork developing her
                own designs in a wide range of styles. Peralta has guested in
                severall tattooshops including “Covil Tattoo” São Paulo
                (Brasil), “Eclipse Tattoo” (Barcelona), “The Bonfire Tattoo”
                Madrid (Spain), “Chill Or Die” Paris (France), as well as others
                in Germany, Switzerland and Portugal.
              </p>
              <p>
                Currently she’s working as graphic designer, tattoo artist and
                painter.
              </p>
              <p>
                Sweevil signature comes up from bounding sweet and evil,
                representing her work mainly based on the concept of duality and
                opposites, their equilibrium and interpretation of freedom. Her
                work is an invitation to embrace life observing both parts of
                every coin free from judgments.
              </p>
            </div>
            <div className="col-md-5">
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
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
