import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import $ from "jquery";
import { listGalleryImages } from "../actions/galleryActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import GalleryImage from "../components/GalleryImage";
import { filters, hide, show } from "../utils";

export default function GalleryScreen(props) {
  const dispatch = useDispatch();
  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery, error } = galleryImageList;

  const [categories, setCategories] = useState([]);

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

  const handleLoad = (category) => {
    setCategories([...categories, category]);
    console.log(categories);
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
      <div className="row center">
        <div className="gallery-container">
          <div className="filters">
            {gallery.length > 0 && (
              <div className="filter" onClick={() => handleClick("*")}>
                All
              </div>
            )}
            {filters.map(
              (filter) =>
                categories.includes(filter) && (
                  <div
                    key={filter}
                    className="filter"
                    onClick={() => handleClick(filter)}
                  >
                    {filter}
                  </div>
                )
            )}
          </div>
          <div className="gallery-images">
            {gallery &&
              gallery.map(
                (galleryImage) =>
                  galleryImage.image &&
                  galleryImage.category && (
                    <div
                      key={galleryImage._id}
                      onLoad={() => handleLoad(galleryImage.category)}
                    >
                      <GalleryImage galleryImage={galleryImage} />
                    </div>
                  )
              )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
