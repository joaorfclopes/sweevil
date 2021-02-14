import React from "react";

export default function GalleryImage(props) {
  const { galleryImage } = props;

  return (
    <div className={`gallery-image ${galleryImage.category}`}>
      <div
        id={`${galleryImage._id}-gallery-img`}
        className="gallery-image-inner"
      >
        <img src={galleryImage.image} alt={`${galleryImage.description}`} />
      </div>
    </div>
  );
}
