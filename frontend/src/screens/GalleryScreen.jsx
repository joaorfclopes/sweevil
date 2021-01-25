import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import $ from "jquery";
import { listGalleryImages } from "../actions/galleryActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import GalleryImage from "../components/GalleryImage";
import GalleryModal from "../components/GalleryModal";
import { filters, hide, show } from "../utils";

export default function GalleryScreen(props) {
  const dispatch = useDispatch();
  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery, error } = galleryImageList;

  const [categories, setCategories] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [largestImageLoaded, setLargestImageLoaded] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const handleClick = (e) => {
    const images = ".gallery-images";
    hide(images);
    if (e === "*") {
      $("#filter-all").addClass("active");
      filters.forEach((filter) => {
        $(`#filter-${filter}`).removeClass("active");
      });
      $(".gallery-image").show();
      show(images);
    } else {
      $("#filter-all").removeClass("active");
      filters.forEach((filter) => {
        if (e !== filter) {
          $(`#filter-${filter}`).removeClass("active");
          $(`.${filter}`).hide();
        } else {
          $(`#filter-${e}`).addClass("active");
          $(`.${filter}`).show();
        }
      });
      show(images);
    }
  };

  const handleLoad = (image, category, id) => {
    setGalleryImages([...galleryImages, image]);
    setCategories([...categories, category]);
    if (id === process.env.REACT_APP_LARGEST_GALLERY_IMAGE_ID) {
      setLargestImageLoaded(true);
      $(".gallery-container").addClass("show");
    }
  };

  useEffect(() => {
    dispatch(listGalleryImages());
  }, [dispatch]);

  const handleOpenModal = (index) => {
    setOpenModal(true);
    setImgIndex(index);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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
          <div className="gallery-images">
            {gallery &&
              gallery.map(
                (galleryImage, index) =>
                  galleryImage.image &&
                  galleryImage.category && (
                    <div
                      key={galleryImage._id}
                      onLoad={() =>
                        handleLoad(
                          galleryImage.image,
                          galleryImage.category,
                          galleryImage._id
                        )
                      }
                      onClick={() => handleOpenModal(index)}
                    >
                      <GalleryImage galleryImage={galleryImage} />
                    </div>
                  )
              )}
          </div>
          <GalleryModal
            open={openModal}
            handleClose={handleCloseModal}
            images={galleryImages}
            imgIndex={imgIndex}
          />
        </div>
      </div>
    </motion.section>
  );
}
