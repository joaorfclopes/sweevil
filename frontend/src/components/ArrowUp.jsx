import React from "react";
import { scrollTop } from "../utils.js";
import Up from "../assets/svg/up-arrow.svg?react";

export default function ArrowUp() {
  return (
    <div className="arrow-up hide" onClick={scrollTop}>
      <Up />
    </div>
  );
}
