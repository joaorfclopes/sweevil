import React from "react";
import spinner from "../assets/images/brand/spinner.png";

export default function LoadingBox() {
  return (
    <div className="loading-box">
      <img className="spinner" src={spinner} alt="spinner" width="50px" />
    </div>
  );
}
