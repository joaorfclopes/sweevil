import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import $ from "jquery";
import { listGalleryImages } from "../actions/galleryActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { filters, hide, show } from "../utils";

export default function GalleryScreen(props) {
  const dispatch = useDispatch();
  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery, error } = galleryImageList;

  const handleClick = (e) => {
    const images = ".gallery-images";
    hide(images);
    if (e === "*") {
      $(".gallery-image").show();
      show(images);
    } else {
      filters.forEach((filter) => {
        if (e !== filter) {
          $(`.${filter}`).hide();
        } else {
          $(`.${filter}`).show();
        }
      });
      show(images);
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
    </motion.section>
  );
}
