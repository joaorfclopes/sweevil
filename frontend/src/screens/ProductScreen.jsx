import * as Sentry from '@sentry/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { addToCart } from '../actions/cartActions';
import { detailsProduct } from '../actions/productActions';
import LoadingOverlay from '../components/LoadingOverlay';
import MessageBox from '../components/MessageBox';
import Placeholder from '../components/Placeholder';
import { useLazyLoad } from '../hooks/useLazyLoad';
import useScrollLock from '../hooks/useScrollLock';
import { scrollTop, sizes } from '../utils';
import { notyf } from '../utils/notyf';

function PreviewThumb({ image, index, onLoaded, onClick }) {
  const [containerRef, inView] = useLazyLoad('300px');
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const handleLoaded = () => {
    setLoaded(true);
    onLoaded(index);
  };

  useEffect(() => {
    if (inView && imgRef.current?.complete && !loaded) handleLoaded();
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="image-preview" onClick={onClick}>
      <Placeholder height="100%" hide={loaded}>
        <div id={`${index}-preview-img`} className="image-preview-inner">
          <img ref={imgRef} src={inView ? image : undefined} alt="product" onLoad={handleLoaded} />
        </div>
      </Placeholder>
    </div>
  );
}

export default function ProductScreen(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const productDetails = useSelector((state) => state.productDetails);
  const { loading, product, error, errorStatus } = productDetails;
  const [qty, setQty] = useState(1);
  const [chosenSize, setChosenSize] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedCarousel, setLoadedCarousel] = useState(new Set());
  const [loadedPreviews, setLoadedPreviews] = useState(new Set());
  useScrollLock(isOpen);

  useEffect(() => {
    if (errorStatus === 404 || errorStatus === 403) {
      navigate('/not-found');
    }
  }, [errorStatus, navigate]);

  useEffect(() => {
    if (product?.slug && /^[a-f0-9]{24}$/.test(productId)) {
      navigate(`/shop/product/${product.slug}`, { replace: true });
    }
  }, [product?.slug, productId, navigate]);

  useEffect(() => {
    scrollTop();
    setCurrentIndex(0);
    dispatch(detailsProduct(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (product && product._id) {
      Sentry.metrics.count('product.viewed', 1, { tags: { product_name: product.name } });
    }
  }, [product?._id]);

  const availability = (val) => {
    return val <= 0;
  };

  const selectSize = (val) => {
    setChosenSize(val);
    setQty(1);
  };

  const selectQty = (val) => {
    return val > 0 ? (
      <>
        <select value={qty} onChange={(e) => setQty(parseInt(e.target.value))}>
          {[...Array(val >= 5 ? 5 : val).keys()].map((x) => (
            <option key={x + 1} value={x + 1}>
              {x + 1}
            </option>
          ))}
        </select>
      </>
    ) : (
      <span style={{ color: 'red', textTransform: 'uppercase' }}>{t('shop.soldOut')}</span>
    );
  };

  const addToCartHandler = async () => {
    dispatch(addToCart(productId, qty, chosenSize));
    window.__cartNav = () => navigate('/cart');
    notyf.success({
      icon: false,
      message: `"${product.name}" adicionado ao <span class="notyf-cart" onclick="window.__cartNav()">${t('shop.cartLink')}</span>`,
      dismissible: true,
    });
  };

  const next = () => {
    setCurrentIndex((i) => (i + 1) % product.images.length);
  };

  const previous = () => {
    setCurrentIndex((i) => (i - 1 + product.images.length) % product.images.length);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: previous,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const imageLoaded = (id) => {
    document.getElementById(`${id}-carousel-img`)?.classList.add('show');
    setLoadedCarousel((prev) => new Set([...prev, id]));
  };

  const previewImageLoaded = (id) => {
    document.getElementById(`${id}-preview-img`)?.classList.add('show');
    setLoadedPreviews((prev) => new Set([...prev, id]));
  };

  const openLightbox = (index) => {
    setImageIndex(index);
    setIsOpen(true);
  };

  return (
    <section className="product-screen">
      {error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <LoadingOverlay loading={loading} minHeight="75vh">
          {product && (
            <div className="product-screen-container row center">
              <div className="product-images">
                <div id="productImageCarousel" className="carousel slide" data-interval="false">
                  <div {...swipeHandlers} className="carousel-inner">
                    {product.images.map((image, index) => (
                      <div
                        key={image}
                        className={`carousel-item product-image ${index === currentIndex ? 'active' : ''}`}
                      >
                        <Placeholder height="100%" hide={loadedCarousel.has(index)}>
                          <div
                            id={`${index}-carousel-img`}
                            className="carousel-image product-image-inner"
                            onClick={() => openLightbox(index)}
                          >
                            <img
                              ref={(node) => {
                                if (node?.complete && !loadedCarousel.has(index))
                                  imageLoaded(index);
                              }}
                              src={image}
                              alt="product"
                              onLoad={() => imageLoaded(index)}
                            />
                          </div>
                        </Placeholder>
                      </div>
                    ))}
                  </div>
                  <div className="arrows">
                    <button
                      className="carousel-control-prev"
                      onClick={previous}
                      aria-label="Previous image"
                    >
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    </button>
                    <button
                      className="carousel-control-next"
                      onClick={next}
                      aria-label="Next image"
                    >
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    </button>
                  </div>
                  <ol className="carousel-indicators">
                    {product.images.map((image, index) => (
                      <li
                        key={index}
                        className={index === currentIndex ? 'active' : ''}
                        onClick={() => setCurrentIndex(index)}
                      ></li>
                    ))}
                  </ol>
                </div>
                <div className="image-preview-container">
                  {product.images.map((image, index) => (
                    <PreviewThumb
                      key={image}
                      image={image}
                      index={index}
                      onLoaded={previewImageLoaded}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>
              </div>
              <Lightbox
                open={isOpen}
                close={() => setIsOpen(false)}
                slides={product.images.map((image) => ({ src: image }))}
                index={imageIndex}
                on={{
                  view: ({ index }) => setImageIndex(index),
                }}
                plugins={[Zoom]}
                noScroll={{ disabled: true }}
                zoom={{
                  maxZoomPixelRatio: 5,
                  zoomInMultiplier: 2,
                  pinchZoomDistanceFactor: 100,
                  wheelZoomDistanceFactor: 100,
                }}
              />
              <div className="product-details">
                <h2 className="name custom-font">
                  <b>{product.name}</b>
                </h2>
                {product.originalPrice && product.originalPrice > product.price ? (
                  <>
                    <h2 className="price price--original">{product.originalPrice.toFixed(2)}€</h2>
                    <h2 className="price">
                      <b>{product.price.toFixed(2)}€</b>
                    </h2>
                  </>
                ) : (
                  <h2 className="price">
                    <b>{product.price && product.price.toFixed(2)}€</b>
                  </h2>
                )}
                <p>
                  <b>{t('shop.category')}:</b> {product.category}
                </p>
                <p className="description">
                  <b>{t('shop.description')}:</b> {product.description}
                </p>
                {product.isClothing && (
                  <div className="size">
                    {sizes.map((size) => (
                      <div key={size} className="size-option">
                        <button
                          onClick={() => selectSize(size)}
                          className={`secondary ${size === chosenSize ? 'active' : ''}`}
                          type="button"
                          disabled={
                            size === 'xs'
                              ? availability(product.countInStock.xs)
                              : size === 's'
                                ? availability(product.countInStock.s)
                                : size === 'm'
                                  ? availability(product.countInStock.m)
                                  : size === 'l'
                                    ? availability(product.countInStock.l)
                                    : size === 'xl'
                                      ? availability(product.countInStock.xl)
                                      : size === 'xxl' && availability(product.countInStock.xxl)
                          }
                        >
                          {size}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="qty">
                  <b>{t('cart.quantity')}:</b>{' '}
                  {product.isClothing
                    ? !chosenSize
                      ? product.countInStock.xs +
                          product.countInStock.s +
                          product.countInStock.m +
                          product.countInStock.l +
                          product.countInStock.xl +
                          product.countInStock.xxl >
                        0
                        ? selectQty(qty)
                        : selectQty(0)
                      : chosenSize === 'xs'
                        ? selectQty(product.countInStock.xs)
                        : chosenSize === 's'
                          ? selectQty(product.countInStock.s)
                          : chosenSize === 'm'
                            ? selectQty(product.countInStock.m)
                            : chosenSize === 'l'
                              ? selectQty(product.countInStock.l)
                              : chosenSize === 'xl'
                                ? selectQty(product.countInStock.xl)
                                : chosenSize === 'xxl' && selectQty(product.countInStock.xxl)
                    : selectQty(product.countInStock.stock)}
                </div>
                <div className="add-to-cart">
                  <button
                    onClick={addToCartHandler}
                    className="primary"
                    disabled={
                      (product.isClothing && !chosenSize) ||
                      (!product.isClothing && product.countInStock.stock <= 0)
                    }
                  >
                    {t('product.addToCart')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </LoadingOverlay>
      )}
    </section>
  );
}
