import React from "react";
import { motion } from "framer-motion";

export default function HomeScreen(props) {
  return (
    <motion.section
      className="not-found-screen"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    ></motion.section>
  );
}
