import React from "react";

export default function LoadingBox(props) {
  return (
    <div className="loading-box" style={{ lineHeight: props.lineHeight }}>
      <img
        className="spinner"
        src={window.location.origin + "/favicon.png"}
        alt="spinner"
        width={props.width ? props.width : "50px"}
      />
    </div>
  );
}
