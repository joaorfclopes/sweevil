import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { listGalleryImages } from "../actions/galleryActions";
import LazyImage from "../components/LazyImage";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";

export default function GalleryScreen() {
  const dispatch = useDispatch();
  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery, error } = galleryImageList;

  useEffect(() => {
    dispatch(listGalleryImages());
  }, [dispatch]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
