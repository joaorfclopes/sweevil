import React, { useEffect } from "react";
import $ from "jquery";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { ReactComponent as Home1 } from "../assets/svg/home/home1.svg";
import { ReactComponent as Home2 } from "../assets/svg/home/home2.svg";
import { ReactComponent as Home3 } from "../assets/svg/home/home3.svg";
import { ReactComponent as Home4 } from "../assets/svg/home/home4.svg";
import { ReactComponent as Emotion1 } from "../assets/svg/home/emotion1.svg";
import { ReactComponent as Emotion2 } from "../assets/svg/home/emotion2.svg";
import { ReactComponent as Emotion3 } from "../assets/svg/home/emotion3.svg";
import { ReactComponent as Emotion4 } from "../assets/svg/home/emotion4.svg";
import { ReactComponent as DevLogo } from "../assets/svg/dev-logo.svg";
import Illustration from "../components/Illustration";

export default function HomeScreen(props) {
  const settings = {
    autoplay: true,
    autoplaySpeed: 1500,
    pauseOnHover: false,
    speed: 500,
    fade: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    swipe: false,
  };

  useEffect(() => {
    setTimeout(() => {
      $(".home-slider").addClass("show");
    }, 50);
  }, []);

  return (
    <motion.section
      className="home"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <div className="row center home-container">
        <div className="home-slider hidden">
          <Slider {...settings}>
            <Illustration
              active
              illustrationLg={<Home1 />}
              illustrationSm={<Emotion1 />}
            />
            <Illustration
              illustrationLg={<Home2 />}
              illustrationSm={<Emotion2 />}
            />
            <Illustration
              illustrationLg={<Home3 />}
              illustrationSm={<Emotion3 />}
            />
            <Illustration
              illustrationLg={<Home4 />}
              illustrationSm={<Emotion4 />}
            />
          </Slider>
        </div>
      </div>
      <div className="developed-by">
        <a
          href={process.env.REACT_APP_DEVELOPER_LINK}
          target="_blank"
          rel="noreferrer"
        >
          Developed by <DevLogo />
        </a>
      </div>
    </motion.section>
  );
}
