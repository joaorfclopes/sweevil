import React from "react";
import spinner from "../assets/images/brand/spinner.png";

export default function LoadingBox(props) {
  return (
    <div className="loading-box" style={{ lineHeight: props.lineHeight }}>
      <img
        className="spinner"
        src={spinner}
        alt="spinner"
        width={props.width ? props.width : "50px"}
      />
    </div>
  );
}
