import React from "react";

export default function PlaceHolder({ children, height, hide, text }) {
  return (
    <div
      className={`placeholder ${hide && "hide"} ${text && "text"}`}
      style={{ minHeight: height }}
    >
      {children}
    </div>
  );
}
