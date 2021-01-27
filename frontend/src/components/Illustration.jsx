import React from "react";

export default function Illustration(props) {
  return (
    <div className="illustration">
      <div className="illustration-lg">{props.illustrationLg}</div>
      <div className="illustration-sm">{props.illustrationSm}</div>
    </div>
  );
}
