import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import $ from "jquery";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import { listGalleryImages } from "../actions/galleryActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import GalleryImage from "../components/GalleryImage";
import GalleryLoader from "../assets/svg/gallery-loader.svg?react";

export default function GalleryScreen() {
  const dispatch = useDispatch();
  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery, error } = galleryImageList;

  const [largestImageLoaded, setLargestImageLoaded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("*");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [galleryExpanded, setGalleryExpanded] = useState(false);

  // Derive category list from the images that actually exist
  const categories = gallery
    ? [...new Set(gallery.map((img) => img.category).filter(Boolean))]
    : [];

  const handleClick = (e) => {
    setSelectedFilter(e);
    if (e !== selectedFilter) {
      $(".gallery-images-container").addClass("invisible");
      $(".gallery-images-container").addClass("hide-instant");
      $(".gallery-images-container").removeClass("show");
      setTimeout(() => {
        $(".gallery-images-container").removeClass("invisible");
        setTimeout(() => {
          $(".gallery-images-container").addClass("show");
        }, 100);
      }, 100);
    }
    if (e === "*") {
      $("#filter-all").addClass("active");
      categories.forEach((filter) => {
        $(`#filter-${filter}`).removeClass("active");
      });
    } else {
      $("#filter-all").removeClass("active");
      categories.forEach((filter) => {
        if (e !== filter) {
          $(`#filter-${filter}`).removeClass("active");
        } else {
          $(`#filter-${e}`).addClass("active");
        }
      });
    }
  };

  const handleLoad = (id) => {
    if (id === import.meta.env.VITE_LARGEST_GALLERY_IMAGE_ID) {
      setLargestImageLoaded(true);
      $(".gallery-images-container").addClass("show");
      $(".gallery-images-container").removeClass("hidden");
    }
  };

  const galleryImg = (galleryImage, index) => {
    return (
      <div
        key={galleryImage._id}
        onClick={() => {
          setLightboxIndex(index);
          setLightboxOpen(true);
        }}
        style={{ cursor: 'pointer' }}
      >
        <GalleryImage
          galleryImage={galleryImage}
          onLoad={() => handleLoad(galleryImage._id)}
        />
      </div>
    );
  };

  useEffect(() => {
    dispatch(listGalleryImages());
  }, [dispatch]);

  // Fallback: show gallery if the target image ID doesn't exist in the data,
  // or if images were already cached and onLoad never fires.
  useEffect(() => {
    if (!loading && gallery && gallery.length > 0 && !largestImageLoaded) {
      const targetExists = gallery.some(
        (img) => img._id === import.meta.env.VITE_LARGEST_GALLERY_IMAGE_ID
      );
      if (!targetExists) {
        setLargestImageLoaded(true);
        $(".gallery-images-container").addClass("show");
        $(".gallery-images-container").removeClass("hidden");
      }
    }
  }, [gallery, loading, largestImageLoaded]);

  const getFilteredGallery = () => {
    if (!gallery) return [];
    if (selectedFilter === "*") {
      return gallery.filter(img => img.image);
    }
    return gallery.filter(img => img.category === selectedFilter);
  };

  const filteredGallery = getFilteredGallery();

  return (
    <section className="gallery" id="gallery">
      {loading ? (
        <LoadingBox lineHeight="75vh" width="100px" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
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
              {categories.map((cat) => (
                <div
                  key={cat}
                  id={`filter-${cat}`}
                  className="filter"
                  onClick={() => handleClick(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
            {!largestImageLoaded && (
              <div className="gallery-loading row center">
                <GalleryLoader />
              </div>
            )}
            <div className={`gallery-collapse-wrapper${galleryExpanded ? " gallery-collapse-expanded" : ""}`}>
              <div className="gallery-images-container hidden">
                <div className="gallery-images">
                  {filteredGallery.map((galleryImage, index) =>
                    galleryImg(galleryImage, index)
                  )}
                </div>
                <Lightbox
                  open={lightboxOpen}
                  close={() => setLightboxOpen(false)}
                  slides={filteredGallery.map((img) => ({
                    src: img.image,
                    description: img.description || undefined,
                  }))}
                  index={lightboxIndex}
                  on={{
                    view: ({ index }) => setLightboxIndex(index),
                  }}
                  plugins={[Captions]}
                />
              </div>
            </div>
            {largestImageLoaded && (
              <div
                className="gallery-collapse-toggle"
                onClick={() => setGalleryExpanded((v) => !v)}
              >
                {galleryExpanded ? "Show less ↑" : "Show all ↓"}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
