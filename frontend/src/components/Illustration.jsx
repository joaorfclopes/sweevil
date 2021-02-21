import React from "react";
import { ReactComponent as Lettering } from "../assets/svg/home/lettering.svg";

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
