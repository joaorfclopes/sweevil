import React from "react";

export default function MaintenanceScreen() {
  return (
    <div className="maintenance-screen">
      <img src="/maintenance.avif" alt="Under maintenance" className="maintenance-image" />
      <h1 className="title">We'll be right back</h1>
      <p>The page is currently under maintenance. Check back soon!</p>
    </div>
  );
}
