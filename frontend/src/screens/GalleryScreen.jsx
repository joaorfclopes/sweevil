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
  const [largestImageLoaded, setLargestImageLoaded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("*");

  const handleClick = (e) => {
    setSelectedFilter(e);
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

  const handleLoad = (category, id) => {
    setCategories([...categories, category]);
    if (id === process.env.REACT_APP_LARGEST_GALLERY_IMAGE_ID) {
      setLargestImageLoaded(true);
      $(".gallery-container").addClass("show");
      $(".gallery-container").removeClass("hidden");
    }
  };

  const galleryImg = (galleryImage) => {
    return (
      <div
        key={galleryImage._id}
        onLoad={() => handleLoad(galleryImage.category, galleryImage._id)}
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
      disablePanzoom: true,
    },
    caption: {
      showCaption: false,
    },
    thumbnails: {
      showThumbnails: false,
    },
    buttons: {
      showDownloadButton: false,
    },
  };

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
        {!largestImageLoaded && (
          <div className="gallery-loading custom-font">Loading images</div>
        )}
        <div className="gallery-container hidden">
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
