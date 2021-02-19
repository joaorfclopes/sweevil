import React from "react";
import { scrollTop } from "../utils.js";
import { ReactComponent as Up } from "../assets/svg/up-arrow.svg";

export default function ArrowUp() {
  return (
    <div className="arrow-up hide" onClick={scrollTop}>
      <Up />
    </div>
  );
}
