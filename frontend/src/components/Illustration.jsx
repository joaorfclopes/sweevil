import React from "react";
import Lettering from "../assets/svg/home/lettering.svg?react";

export default function Illustration(props) {
  return (
    <div className="illustration">
      <div className="illustration-lg">{props.illustrationLg}</div>
      <div className="illustration-sm">
        {props.illustrationSm}
        <Lettering />
      </div>
    </div>
  );
}
