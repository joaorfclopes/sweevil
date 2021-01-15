import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { listGalleryImages } from "../actions/galleryActions";
import LazyImage from "../components/LazyImage";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";

export default function GalleryScreen(props) {
  const dispatch = useDispatch();
  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery, error } = galleryImageList;

  useEffect(() => {
    dispatch(listGalleryImages());
  }, [dispatch]);

  return (
    <motion.section
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      {loading ? (
        <LoadingBox lineHeight="70vh" width="100px" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <div className="gallery">
          {gallery &&
            gallery.map((galleryImage) => (
              <LazyImage
                key={galleryImage.image}
                src={galleryImage.image}
                alt="gallery-img"
              />
            ))}
        </div>
      )}
    </motion.section>
  );
}
