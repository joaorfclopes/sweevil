import React, { useEffect } from "react";
import $ from "jquery";
import Slider from "react-slick";
import { ReactComponent as Home1 } from "../assets/svg/home/home1.svg";
import { ReactComponent as Home2 } from "../assets/svg/home/home2.svg";
import { ReactComponent as Home3 } from "../assets/svg/home/home3.svg";
import { ReactComponent as Home4 } from "../assets/svg/home/home4.svg";
import { ReactComponent as Emotion1 } from "../assets/svg/home/emotion1.svg";
import { ReactComponent as Emotion2 } from "../assets/svg/home/emotion2.svg";
import { ReactComponent as Emotion3 } from "../assets/svg/home/emotion3.svg";
import { ReactComponent as Emotion4 } from "../assets/svg/home/emotion4.svg";
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
    $(".home-slider").addClass("show");
  }, []);

  return (
    <section className="home" id="home">
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
    </section>
  );
}
