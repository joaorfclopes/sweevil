import React from "react";
import $ from "jquery";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function GalleryImage(props) {
  const { galleryImage } = props;

  const imageLoaded = (id) => {
    $(`#${id}-gallery-img`).addClass("show");
  };

  return (
    <div className={`gallery-image ${galleryImage.category}`}>
      <div
        id={`${galleryImage._id}-gallery-img`}
        className="gallery-image-inner"
      >
        <LazyLoadImage
          src={galleryImage.image}
          alt={`${galleryImage.name} - ${galleryImage.year}`}
          afterLoad={() => imageLoaded(galleryImage._id)}
        />
      </div>
    </div>
  );
}
