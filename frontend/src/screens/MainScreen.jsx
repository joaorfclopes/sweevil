import React from "react";
import { motion } from "framer-motion";
import HomeScreen from "./HomeScreen";
import AboutScreen from "./AboutScreen";
import GalleryScreen from "./GalleryScreen";
import Footer from "../components/Footer";

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
      <Footer />
    </motion.section>
  );
}
