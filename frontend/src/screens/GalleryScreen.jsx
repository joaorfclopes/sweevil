import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { listGalleryImages } from "../actions/galleryActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import GalleryImage from "../components/GalleryImage";

export default function GalleryScreen(props) {
  const dispatch = useDispatch();
  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery, error } = galleryImageList;

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
        <div className="filter">All</div>
        <div className="filter">Art</div>
        <div className="filter">Digital</div>
        <div className="filter">Tapecaria</div>
        <div className="filter">Tattoos</div>
      </div>
      <div className="gallery-container">
        <div className="images">
          {gallery &&
            gallery.map(
              (galleryImage) =>
                galleryImage.image && (
                  <GalleryImage
                    key={galleryImage._id}
                    galleryImage={galleryImage}
                  />
                )
            )}
        </div>
      </div>
    </motion.section>
  );
}
