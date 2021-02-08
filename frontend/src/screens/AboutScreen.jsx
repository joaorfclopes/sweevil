import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import $ from "jquery";
import { Notyf } from "notyf";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Tooltip from "@material-ui/core/Tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import video from "../assets/video/video.mp4";
import { ReactComponent as Play } from "../assets/svg/play.svg";
import { ReactComponent as Email } from "../assets/svg/email.svg";
import { ReactComponent as Instagram } from "../assets/svg/instagram.svg";
import { ReactComponent as Location } from "../assets/svg/location.svg";
import Placeholder from "../components/Placeholder";

export default function AboutScreen(props) {
  const [play, setPlay] = useState(false);
  const notyf = new Notyf();

  const videoLoaded = () => {
    $("#video").addClass("show");
    $(".play").addClass("show");
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

  const copied = (id, size) => {
    notyf.success({
      icon: false,
      message: "Email copied to clipboard!",
      dismissible: true,
    });
  };

  return (
    <motion.section
      className="about"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <div className="row about-container">
        <div className="text">
          <h1 className="title">Who's Sweevil?</h1>
          <p>
            Sílvia Peralta is a multi-disciplinary artist from Portugal born in
            1992.
          </p>

          <p>
            In 2013 after finishing a BfA in Design studies in Porto she started
            tattooing independently.
          </p>
          <p>
            As a tattoo artist she specialized in blackwork developing her own
            designs in a wide range of styles. Peralta has guested in severall
            tattooshops including “Covil Tattoo” São Paulo (Brasil), “Eclipse
            Tattoo” (Barcelona), “The Bonfire Tattoo” Madrid (Spain), “Chill Or
            Die” Paris (France), as well as others in Germany, Switzerland and
            Portugal.
          </p>
          <p>
            Currently she’s working as graphic designer, tattoo artist and
            painter.
          </p>
          <p>
            Sweevil signature comes up from bounding sweet and evil,
            representing her work mainly based on the concept of duality and
            opposites, their equilibrium and interpretation of freedom. Her work
            is an invitation to embrace life observing both parts of every coin
            free from judgments.
          </p>
        </div>
        <div className="video">
          <Placeholder>
            <video
              id="video"
              poster={window.location.origin + "/sweevil.jpg"}
              controls={play}
              onMouseEnter={() => setPlay(true)}
              onMouseLeave={() => setPlay(false)}
            >
              <source src={video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="play">
              <Play />
            </div>
            <div className="poster">
              <LazyLoadImage
                src={window.location.origin + "/sweevil.jpg"}
                afterLoad={videoLoaded}
              />
            </div>
          </Placeholder>
        </div>
      </div>
      <div className="contacts">
        <div className="line"></div>
        <div className="logos-container">
          <a
            href={process.env.REACT_APP_INSTAGRAM_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <Tooltip title="Instagram">
              <Instagram />
            </Tooltip>
          </a>
          <CopyToClipboard
            text={process.env.REACT_APP_SENDER_EMAIL_ADDRESS}
            onCopy={copied}
          >
            <Tooltip title="Email">
              <Email />
            </Tooltip>
          </CopyToClipboard>
          <a
            href={process.env.REACT_APP_LOCATION_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <Tooltip title="Location">
              <Location />
            </Tooltip>
          </a>
        </div>
      </div>
    </motion.section>
  );
}
