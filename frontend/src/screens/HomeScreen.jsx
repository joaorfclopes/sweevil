import React from "react";
import { motion } from "framer-motion";
import { ReactComponent as Home1 } from "../assets/svg/home/home1.svg";
import { ReactComponent as Doll1 } from "../assets/svg/home/doll1.svg";
import Illustration from "../components/Illustration";

export default function HomeScreen(props) {
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
        <Illustration illustrationLg={<Home1 />} illustrationSm={<Doll1 />} />
      </div>
    </motion.section>
  );
}
