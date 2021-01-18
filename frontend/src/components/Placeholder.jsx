import React from "react";

export default function PlaceHolder({ children, height, hide }) {
  return (
    <div
      className={`placeholder ${hide && "hide"}`}
      style={{ minHeight: height }}
    >
      {children}
    </div>
  );
}
