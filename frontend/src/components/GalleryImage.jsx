import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function GalleryImage(props) {
  const { galleryImage } = props;

  return (
    <div className="gallery-image" key={galleryImage._id}>
      <LazyLoadImage
        src={galleryImage.image}
        alt={galleryImage.image}
        effect="blur"
      />
    </div>
  );
}
