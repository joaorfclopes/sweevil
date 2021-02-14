import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import $ from "jquery";
import { SRLWrapper } from "simple-react-lightbox";
import { listGalleryImages } from "../actions/galleryActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import GalleryImage from "../components/GalleryImage";
import { filters } from "../utils";

export default function GalleryScreen(props) {
  const dispatch = useDispatch();
  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery, error } = galleryImageList;

  const [categories, setCategories] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("*");

  const handleClick = (e) => {
    setSelectedFilter(e);
    if (e !== selectedFilter) {
      $(".gallery-images").addClass("invisible");
      $(".gallery-images").addClass("hide-instant");
      $(".gallery-images").removeClass("show");
      setTimeout(() => {
        $(".gallery-images").removeClass("invisible");
        setTimeout(() => {
          $(".gallery-images").addClass("show");
        }, 100);
      }, 100);
    }
    if (e === "*") {
      $("#filter-all").addClass("active");
      filters.forEach((filter) => {
        $(`#filter-${filter}`).removeClass("active");
      });
    } else {
      $("#filter-all").removeClass("active");
      filters.forEach((filter) => {
        if (e !== filter) {
          $(`#filter-${filter}`).removeClass("active");
        } else {
          $(`#filter-${e}`).addClass("active");
        }
      });
    }
  };

  const handleLoad = (category) => {
    setCategories([...categories, category]);
  };

  const galleryImg = (galleryImage) => {
    return (
      <div
        key={galleryImage._id}
        onLoad={() => handleLoad(galleryImage.category)}
      >
        <GalleryImage galleryImage={galleryImage} />
      </div>
    );
  };

  useEffect(() => {
    dispatch(listGalleryImages());
  }, [dispatch]);

  const lightboxOptions = {
    settings: {
      lightboxTransitionSpeed: 0.2,
      slideTransitionSpeed: 0.3,
      disableWheelControls: true,
    },
    thumbnails: {
      showThumbnails: false,
    },
    buttons: {
      showDownloadButton: false,
    },
  };

  return loading ? (
    <LoadingBox lineHeight="100vh" width="100px" />
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
              <div
                id="filter-all"
                className="filter active"
                onClick={() => handleClick("*")}
              >
                All
              </div>
            )}
            {filters.map(
              (filter) =>
                categories.includes(filter) && (
                  <div
                    key={filter}
                    id={`filter-${filter}`}
                    className="filter"
                    onClick={() => handleClick(filter)}
                  >
                    {filter}
                  </div>
                )
            )}
          </div>
          <SRLWrapper options={lightboxOptions}>
            <div className="gallery-images">
              {gallery &&
                gallery.map((galleryImage) =>
                  galleryImage.image && selectedFilter === "*"
                    ? galleryImg(galleryImage)
                    : galleryImage.category === selectedFilter &&
                      galleryImg(galleryImage)
                )}
            </div>
          </SRLWrapper>
        </div>
      </div>
    </motion.section>
  );
}
