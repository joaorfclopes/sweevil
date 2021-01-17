import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import $ from "jquery";
import { listGalleryImages } from "../actions/galleryActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { filters } from "../utils";

export default function GalleryScreen(props) {
  const dispatch = useDispatch();
  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery, error } = galleryImageList;

  const handleClick = (e) => {
    if (e === "*") {
      $(".gallery-image").removeClass("hide");
    } else if (e === "Tattoos") {
      $(".Tattoos").removeClass("hide");
      $(".Art").addClass("hide");
      $(".Digital").addClass("hide");
      $(".Tapecaria").addClass("hide");
    } else if (e === "Art") {
      $(".Tattoos").addClass("hide");
      $(".Art").removeClass("hide");
      $(".Digital").addClass("hide");
      $(".Tapecaria").addClass("hide");
    } else if (e === "Digital") {
      $(".Tattoos").addClass("hide");
      $(".Art").addClass("hide");
      $(".Digital").removeClass("hide");
      $(".Tapecaria").addClass("hide");
    } else if (e === "Tapecaria") {
      $(".Tattoos").addClass("hide");
      $(".Art").addClass("hide");
      $(".Digital").addClass("hide");
      $(".Tapecaria").removeClass("hide");
    }
  };

  useEffect(() => {
    dispatch(listGalleryImages());
  }, [dispatch]);

  return loading ? (
    <LoadingBox lineHeight="75vh" width="100px" />
  ) : error ? (
    <MessageBox variant="error">{error}</MessageBox>
  ) : (
    <motion.section
      className="gallery"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <div className="filters">
        <div className="filter" onClick={() => handleClick("*")}>
          All
        </div>
        {filters.map((filter) => (
          <div
            key={filter}
            className="filter"
            onClick={() => handleClick(filter)}
          >
            {filter}
          </div>
        ))}
      </div>
      <div className="gallery-container">
        <div className="gallery-images">
          {gallery &&
            gallery.map(
              (galleryImage) =>
                galleryImage.image &&
                galleryImage.category && (
                  <div
                    key={galleryImage._id}
                    className={`gallery-image ${galleryImage.category}`}
                  >
                    <LazyLoadImage
                      src={galleryImage.image}
                      alt={galleryImage.image}
                      effect="blur"
                    />
                  </div>
                )
            )}
        </div>
      </div>
    </motion.section>
  );
}
