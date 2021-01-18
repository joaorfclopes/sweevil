import React from "react";

export default function PlaceHolder({ children, height }) {
  return (
    <div className="placeholder" style={{ height: height }}>
      {children}
    </div>
  );
}
