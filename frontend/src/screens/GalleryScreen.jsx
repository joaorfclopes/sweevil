import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/plugins/captions.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { listCategories } from '../actions/categoryActions';
import { listGalleryImages } from '../actions/galleryActions';
import GalleryImage from '../components/GalleryImage';
import LoadingOverlay from '../components/LoadingOverlay';
import MessageBox from '../components/MessageBox';
import useScrollLock from '../hooks/useScrollLock';
import { scrollWithOffset } from '../utils';
import { displayDescription, displayName } from '../utils/i18nDisplay';

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
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return colCount;
}

export default function GalleryScreen() {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const galleryImageList = useSelector((state) => state.galleryImageList);
  const { loading, gallery, error } = galleryImageList;
  const { categories: dbCategories = [] } = useSelector((state) => state.categoryList);

  const [selectedFilter, setSelectedFilter] = useState('*');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);

  const colCount = useColCount();
  useScrollLock(lightboxOpen);
  const hashScrolled = useRef(false);

  // Use ordered DB categories; fall back to image-derived names for any not yet synced
  const categoryMap = Object.fromEntries(dbCategories.map((c) => [c.name, c]));
  const imageCatNames = gallery
    ? [...new Set(gallery.map((img) => img.category).filter(Boolean))]
    : [];
  const extras = imageCatNames.filter((n) => !categoryMap[n]);
  const categories = [...dbCategories, ...extras.map((name) => ({ name }))];

  const handleClick = (e) => {
    setSelectedFilter(e);
  };

  useEffect(() => {
    dispatch(listGalleryImages());
    dispatch(listCategories());
  }, [dispatch]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleRows(INITIAL_ROWS);
  }, [selectedFilter]);

  // Hash scroll: App.jsx skips #gallery. We handle it here after About settles.
  // About has two async layout shifts: text API load + video loadedmetadata.
  // We observe About's height and re-scroll on each change until the user
  // scrolls manually or 5s has elapsed (covers video load on slow connections).
  useEffect(() => {
    if (loading || !gallery?.length || hashScrolled.current) return;
    if (window.location.hash !== '#gallery') return;
    hashScrolled.current = true;

    let programmaticScroll = false;
    let userScrolled = false;
    let debounce;

    const onScroll = () => {
      if (!programmaticScroll) userScrolled = true;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const scrollToGallery = () => {
      if (userScrolled) return;
      programmaticScroll = true;
      const el = document.getElementById('gallery');
      if (el) scrollWithOffset(el);
      setTimeout(() => {
        programmaticScroll = false;
      }, 600);
    };

    const aboutEl = document.getElementById('about');
    if (!aboutEl) {
      scrollToGallery();
      window.removeEventListener('scroll', onScroll);
      return;
    }

    const observer = new ResizeObserver(() => {
      if (userScrolled) {
        observer.disconnect();
        return;
      }
      clearTimeout(debounce);
      debounce = setTimeout(scrollToGallery, 50);
    });
    observer.observe(aboutEl);

    // Stop observing after 5s — covers video loadedmetadata on slow connections
    const stopTimer = setTimeout(() => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      scrollToGallery();
    }, 5000);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      clearTimeout(debounce);
      clearTimeout(stopTimer);
    };
  }, [loading, gallery]);

  const getFilteredGallery = () => {
    if (!gallery) return [];
    if (selectedFilter === '*') return gallery.filter((img) => img.image);
    return gallery.filter((img) => img.category === selectedFilter);
  };

  const filteredGallery = getFilteredGallery();
  // visibleCount is always a multiple of colCount → every column gets the same number of images
  const visibleCount = visibleRows * colCount;
  const visibleGallery = filteredGallery.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGallery.length;

  // Full rows round-robin, last partial row right-aligned so the gap falls on the left
  const columns = (() => {
    const n = visibleGallery.length;
    const fullRows = Math.floor(n / colCount);
    const extra = n % colCount;
    const cols = Array.from({ length: colCount }, () => []);

    for (let row = 0; row < fullRows; row++) {
      for (let ci = 0; ci < colCount; ci++) {
        const idx = row * colCount + ci;
        cols[ci].push({ img: visibleGallery[idx], idx });
      }
    }

    const startCol = colCount - extra;
    for (let i = 0; i < extra; i++) {
      const idx = fullRows * colCount + i;
      cols[startCol + i].push({ img: visibleGallery[idx], idx });
    }

    return cols;
  })();

  return (
    <section className="gallery" id="gallery">
      {error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <LoadingOverlay loading={loading && !gallery?.length} minHeight="75vh">
          <div className="row center">
            <div className="gallery-container">
              <div className="filters">
                {gallery?.length > 0 && (
                  <div
                    id="filter-all"
                    className={`filter ${selectedFilter === '*' ? 'active' : ''}`}
                    onClick={() => handleClick('*')}
                  >
                    {t('shop.filterAll')}
                  </div>
                )}
                {categories.map((cat) => (
                  <div
                    key={cat.name}
                    id={`filter-${cat.name}`}
                    className={`filter ${selectedFilter === cat.name ? 'active' : ''}`}
                    onClick={() => handleClick(cat.name)}
                  >
                    {displayName(cat, i18n.language)}
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
                          style={{ cursor: 'pointer' }}
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
                    description: displayDescription(img, i18n.language) || undefined,
                  }))}
                  index={lightboxIndex}
                  on={{
                    view: ({ index }) => setLightboxIndex(index),
                  }}
                  plugins={[Captions, Zoom]}
                  noScroll={{ disabled: true }}
                  zoom={{
                    maxZoomPixelRatio: 5,
                    zoomInMultiplier: 2,
                    pinchZoomDistanceFactor: 100,
                    wheelZoomDistanceFactor: 100,
                  }}
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
        </LoadingOverlay>
      )}
    </section>
  );
}
