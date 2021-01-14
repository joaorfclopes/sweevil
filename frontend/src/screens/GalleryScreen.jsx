import React from "react";
import LazyImage from "../components/LazyImage";
import { photos } from "./photos.js";

export default function GalleryScreen() {
  return (
    <section className="gallery">
      <div className="gallery-container">
        {photos.map((photo) => (
          <LazyImage key={photo.src} src={photo.src} alt="gallery-img" />
        ))}
      </div>
    </section>
  );
}
