import React from "react";
import $ from "jquery";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Placeholder from "./Placeholder";

export default function GalleryImage(props) {
  const { galleryImage } = props;

  const imageLoaded = (id) => {
    $(`#${id}-gallery-img`).addClass("show");
  };

  return (
    <div className={`gallery-image ${galleryImage.category}`}>
      <Placeholder height="100%">
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
      </Placeholder>
    </div>
  );
}
