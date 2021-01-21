import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NotFoundScreen(props) {
  return (
    <motion.section
      className="not-found-screen"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <div className="row center not-found-screen-container">
        <div className="not-found">
          <h1 className="title">Oops, page not found...</h1>
          <Link to="/">
            <button className="secondary">Take Me Home</button>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
