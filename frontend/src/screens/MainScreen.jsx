import React from "react";
import HomeScreen from "./HomeScreen";
import AboutScreen from "./AboutScreen";
import GalleryScreen from "./GalleryScreen";
import { motion } from "framer-motion";

export default function MainScreen(props) {
  return (
    <motion.section
      className="main"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <HomeScreen />
      <AboutScreen />
      <GalleryScreen />
    </motion.section>
  );
}
