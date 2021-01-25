import React, { useState } from "react";
import $ from "jquery";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Placeholder from "./Placeholder";
import GalleryModal from "./GalleryModal";

export default function GalleryImage(props) {
  const { galleryImage } = props;

  const [openModal, setOpenModal] = useState(false);

  const imageLoaded = (id) => {
    $(`#${id}-gallery-img`).addClass("show");
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <div className={`gallery-image ${galleryImage.category}`}>
      <Placeholder height="100%">
        <div
          id={`${galleryImage._id}-gallery-img`}
          className="gallery-image-inner"
          onClick={handleOpenModal}
        >
          <LazyLoadImage
            src={galleryImage.image}
            alt={galleryImage.image}
            afterLoad={() => imageLoaded(galleryImage._id)}
          />
        </div>
      </Placeholder>
      <GalleryModal
        open={openModal}
        handleClose={handleCloseModal}
        image={galleryImage.image}
      />
    </div>
  );
}
