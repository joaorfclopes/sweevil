import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import $ from "jquery";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import { listGalleryImages } from "../actions/galleryActions";
import { listCategories } from "../actions/categoryActions";
import useScrollLock from "../hooks/useScrollLock";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import GalleryImage from "../components/GalleryImage";

const INITIAL_ROWS = 3;
const ROWS_INCREMENT = 3;

function getColCount() {
  const w = window.innerWidth;
  if (w >= 992) return 4;
  if (w >= 768) return 3;
  if (w >= 576) return 2;
  return 1;
}

function useColCount() {
  const [colCount, setColCount] = useState(getColCount);
  useEffect(() => {
    const onResize = () => setColCount(getColCount());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return colCount;
}

export default function GalleryScreen() {
  const dispatch = useDispatch();
  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery, error } = galleryImageList;
  const { categories: dbCategories = [] } = useSelector((state) => state.categoryList);

  const [selectedFilter, setSelectedFilter] = useState("*");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);

  const colCount = useColCount();

  useScrollLock(lightboxOpen);

  // Use ordered DB categories; fall back to image-derived names for any not yet synced
  const dbCatNames = dbCategories.map((c) => c.name);
  const imageCatNames = gallery ? [...new Set(gallery.map((img) => img.category).filter(Boolean))] : [];
  const extras = imageCatNames.filter((n) => !dbCatNames.includes(n));
  const categories = [...dbCatNames, ...extras];

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

  useEffect(() => {
    dispatch(listGalleryImages());
    dispatch(listCategories());
  }, [dispatch]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleRows(INITIAL_ROWS);
  }, [selectedFilter]);

  const getFilteredGallery = () => {
    if (!gallery) return [];
    if (selectedFilter === "*") return gallery.filter((img) => img.image);
    return gallery.filter((img) => img.category === selectedFilter);
  };

  const filteredGallery = getFilteredGallery();
  // visibleCount is always a multiple of colCount → every column gets the same number of images
  const visibleCount = visibleRows * colCount;
  const visibleGallery = filteredGallery.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGallery.length;

  // Round-robin distribute images across columns so position is stable
  // regardless of how many images are currently visible
  const columns = Array.from({ length: colCount }, (_, ci) => {
    const col = [];
    for (let i = ci; i < visibleGallery.length; i += colCount) {
      col.push({ img: visibleGallery[i], idx: i });
    }
    return col;
  });

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
            <div className="gallery-images-container show">
              <div className="gallery-images-flex">
                {columns.map((col, ci) => (
                  <div key={ci} className="gallery-images-col">
                    {col.map(({ img, idx }) => (
                      <div
                        key={img._id}
                        onClick={() => {
                          setLightboxIndex(idx);
                          setLightboxOpen(true);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <GalleryImage galleryImage={img} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={visibleGallery.map((img) => ({
                  src: img.image,
                  description: img.description || undefined,
                }))}
                index={lightboxIndex}
                on={{
                  view: ({ index }) => setLightboxIndex(index),
                }}
                plugins={[Captions]}
                noScroll={{ disabled: true }}
              />
            </div>
            {(hasMore || visibleRows > INITIAL_ROWS) && (
              <div className="gallery-collapse-toggle-row">
                {visibleRows > INITIAL_ROWS && (
                  <div
                    className="gallery-collapse-toggle"
                    onClick={() => setVisibleRows(INITIAL_ROWS)}
                  >
                    Show less ↑
                  </div>
                )}
                {hasMore && (
                  <div
                    className="gallery-collapse-toggle"
                    onClick={() => setVisibleRows((prev) => prev + ROWS_INCREMENT)}
                  >
                    Show more ↓
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
