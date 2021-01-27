import React from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { ReactComponent as Home1 } from "../assets/svg/home/home1.svg";
import { ReactComponent as Home2 } from "../assets/svg/home/home2.svg";
import { ReactComponent as Home3 } from "../assets/svg/home/home3.svg";
import { ReactComponent as Home4 } from "../assets/svg/home/home4.svg";
import { ReactComponent as Doll1 } from "../assets/svg/home/doll1.svg";
import { ReactComponent as Doll2 } from "../assets/svg/home/doll2.svg";
import { ReactComponent as Doll3 } from "../assets/svg/home/doll3.svg";
import { ReactComponent as Doll4 } from "../assets/svg/home/doll4.svg";
import Illustration from "../components/Illustration";

export default function HomeScreen(props) {
  const settings = {
    infinite: true,
    speed: 500,
    fade: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    swipe: false,
  };

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
        <div className="home-slider">
          <Slider {...settings}>
            <Illustration
              active
              illustrationLg={<Home1 />}
              illustrationSm={<Doll1 />}
            />
            <Illustration
              illustrationLg={<Home2 />}
              illustrationSm={<Doll2 />}
            />
            <Illustration
              illustrationLg={<Home3 />}
              illustrationSm={<Doll3 />}
            />
            <Illustration
              illustrationLg={<Home4 />}
              illustrationSm={<Doll4 />}
            />
          </Slider>
        </div>
      </div>
    </motion.section>
  );
}
