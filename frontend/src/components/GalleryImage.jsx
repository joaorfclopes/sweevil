import React, { useState } from "react";
import $ from "jquery";
import Placeholder from "./Placeholder";

export default function GalleryImage({ galleryImage }) {
  const [hidePlaceholder, setHidePlaceholder] = useState(false);

  const imageLoaded = (id) => {
    $(`#${id}-gallery-img`).addClass("show");
    setHidePlaceholder(true);
  };

  return (
    <div className={`gallery-image ${galleryImage.category}`}>
      <Placeholder hide={hidePlaceholder}>
        <div id={`${galleryImage._id}-gallery-img`} className="gallery-image-inner">
          <img
            src={galleryImage.image}
            alt={galleryImage.description || ""}
            loading="lazy"
            onLoad={() => imageLoaded(galleryImage._id)}
          />
        </div>
      </Placeholder>
    </div>
  );
}
