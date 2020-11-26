import React from "react";
import Spinner from "../components/Spinner";

export default function LoadingScreen() {
  return (
    <div className="loading">
      <div>
        <Spinner />
      </div>
    </div>
  );
}
