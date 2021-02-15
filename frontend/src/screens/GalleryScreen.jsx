import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import $ from "jquery";
import { SRLWrapper } from "simple-react-lightbox";
import { listGalleryImages } from "../actions/galleryActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import GalleryImage from "../components/GalleryImage";
import { filters } from "../utils";
import { ReactComponent as GalleryLoader } from "../assets/svg/gallery-loader.svg";

export default function GalleryScreen() {
  const dispatch = useDispatch();
  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery, error } = galleryImageList;

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

  const handleLoad = (id) => {
    if (id === process.env.REACT_APP_LARGEST_GALLERY_IMAGE_ID) {
      setLargestImageLoaded(true);
      $(".gallery-images-container").addClass("show");
      $(".gallery-images-container").removeClass("hidden");
    }
  };

  const galleryImg = (galleryImage) => {
    return (
      <div key={galleryImage._id} onLoad={() => handleLoad(galleryImage._id)}>
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

  return (
    <section className="gallery" id="gallery">
      {loading ? (
        <LoadingBox lineHeight="100vh" width="100px" />
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
              {filters.map((filter) => (
                <div
                  key={filter}
                  id={`filter-${filter}`}
                  className="filter"
                  onClick={() => handleClick(filter)}
                >
                  {filter}
                </div>
              ))}
            </div>
            {!largestImageLoaded && (
              <div className="gallery-loading row center">
                <GalleryLoader />
              </div>
            )}
            <div className="gallery-images-container hidden">
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
        </div>
      )}
    </section>
  );
}
