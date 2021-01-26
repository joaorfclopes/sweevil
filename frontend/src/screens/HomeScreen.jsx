import React from "react";
import { motion } from "framer-motion";
import { ReactComponent as Doll1 } from "../assets/svg/home/doll1.svg";
import { ReactComponent as Doll2 } from "../assets/svg/home/doll2.svg";
import { ReactComponent as Doll3 } from "../assets/svg/home/doll3.svg";
import { ReactComponent as Doll4 } from "../assets/svg/home/doll4.svg";

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
        <div className="illustration">
          <Doll1 />
          <Doll2 />
          <Doll3 />
          <Doll4 />
        </div>
      </div>
    </motion.section>
  );
}
