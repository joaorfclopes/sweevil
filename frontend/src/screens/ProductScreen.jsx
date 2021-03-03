import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Notyf } from "notyf";
import { motion } from "framer-motion";
import $ from "jquery";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useSwipeable } from "react-swipeable";
import Lightbox from "react-image-lightbox";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Placeholder from "../components/Placeholder";
import { detailsProduct } from "../actions/productActions";
import { addToCart } from "../actions/cartActions";
import { sizes, scrollTop } from "../utils";

export default function ProductScreen(props) {
  const dispatch = useDispatch();
  const productId = props.match.params.id;
  const productDetails = useSelector((state) => state.productDetails);
  const { loading, product, error } = productDetails;
  const [qty, setQty] = useState(1);
  const [chosenSize, setChosenSize] = useState("");
  const notyf = new Notyf();
  const [isOpen, setIsOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    scrollTop();
    dispatch(detailsProduct(productId));
  }, [dispatch, productId]);

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
      <span style={{ color: "red", textTransform: "uppercase" }}>Sold Out</span>
    );
  };

  const addToCartHandler = async () => {
    dispatch(addToCart(productId, qty, chosenSize));
    notyf
      .success({
        icon: false,
        message: `${product.name} added <b>to cart</b>`,
        dismissible: true,
      })
      .on("click", () => {
        props.history.push("/cart");
      });
  };

  const next = () => {
    document.getElementById("carousel-control-next").click();
  };

  const previous = () => {
    document.getElementById("carousel-control-prev").click();
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => next(),
    onSwipedRight: () => previous(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const imageLoaded = (id) => {
    $(`#${id}-carousel-img`).addClass("show");
  };

  const previewImageLoaded = (id) => {
    $(`#${id}-preview-img`).addClass("show");
  };

  const openLightbox = (index) => {
    setImageIndex(index);
    setIsOpen(true);
  };

  return (
    <motion.section
      className="product-screen"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      {loading ? (
        <LoadingBox lineHeight="75vh" width="100px" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <div className="product-screen-container row center">
          <div className="product-images">
            <div
              id="productImageCarousel"
              className="carousel slide"
              data-interval="false"
            >
              <div {...swipeHandlers} className="carousel-inner">
                {product.images.map((image, index) => (
                  <div
                    key={image}
                    className={`carousel-item product-image ${
                      image === product.images[0] && "active"
                    }`}
                  >
                    <Placeholder height="100%">
                      <div
                        id={`${index}-carousel-img`}
                        className="carousel-image product-image-inner"
                        onClick={() => openLightbox(index)}
                      >
                        <LazyLoadImage
                          src={image}
                          alt="product"
                          afterLoad={() => imageLoaded(index)}
                        />
                      </div>
                    </Placeholder>
                  </div>
                ))}
              </div>
              <div className="arrows">
                <a
                  id="carousel-control-prev"
                  className="carousel-control-prev"
                  href="#productImageCarousel"
                  role="button"
                  data-slide="prev"
                >
                  <span
                    className="carousel-control-prev-icon"
                    aria-hidden="true"
                  ></span>
                </a>
                <a
                  id="carousel-control-next"
                  className="carousel-control-next"
                  href="#productImageCarousel"
                  role="button"
                  data-slide="next"
                >
                  <span
                    className="carousel-control-next-icon"
                    aria-hidden="true"
                  ></span>
                </a>
              </div>
              <ol className="carousel-indicators">
                {product.images.map((image, index) => (
                  <li
                    key={index}
                    data-target="#productImageCarousel"
                    data-slide-to={index}
                    className={`${image === product.images[0] && "active"}`}
                  ></li>
                ))}
              </ol>
            </div>
            <div className="image-preview-container">
              {product.images.map((image, index) => (
                <div
                  key={image}
                  className="image-preview"
                  data-target="#productImageCarousel"
                  data-slide-to={index}
                >
                  <Placeholder height="100%">
                    <div
                      id={`${index}-preview-img`}
                      className="image-preview-inner"
                    >
                      <LazyLoadImage
                        src={image}
                        alt="product"
                        afterLoad={() => previewImageLoaded(index)}
                      />
                    </div>
                  </Placeholder>
                </div>
              ))}
            </div>
          </div>
          {isOpen && (
            <Lightbox
              mainSrc={product.images[imageIndex]}
              onCloseRequest={() => setIsOpen(false)}
              nextSrc={product.images[(imageIndex + 1) % product.images.length]}
              prevSrc={
                product.images[
                  (imageIndex + product.images.length - 1) %
                    product.images.length
                ]
              }
              onMoveNextRequest={() =>
                setImageIndex((imageIndex + 1) % product.images.length)
              }
              onMovePrevRequest={() =>
                setImageIndex(
                  (imageIndex + product.images.length - 1) %
                    product.images.length
                )
              }
              animationDisabled
            />
          )}
          <div className="product-details">
            <h2 className="name custom-font">
              <b>{product.name}</b>
            </h2>
            <h2 className="price">
              <b>{product.price && product.price.toFixed(2)}€</b>
            </h2>
            <p>
              <b>Category:</b> {product.category}
            </p>
            <p>
              <b>Description:</b> {product.description}
            </p>
            {product.isClothing && (
              <div className="size">
                {sizes.map((size) => (
                  <div key={size} className="size-option">
                    <button
                      onClick={() => selectSize(size)}
                      className={`secondary ${
                        size === chosenSize ? "active" : ""
                      }`}
                      type="button"
                      disabled={
                        size === "xs"
                          ? availability(product.countInStock.xs)
                          : size === "s"
                          ? availability(product.countInStock.s)
                          : size === "m"
                          ? availability(product.countInStock.m)
                          : size === "l"
                          ? availability(product.countInStock.l)
                          : size === "xl"
                          ? availability(product.countInStock.xl)
                          : size === "xxl" &&
                            availability(product.countInStock.xxl)
                      }
                    >
                      {size}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="qty">
              <b>Quantity:</b>{" "}
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
                  : chosenSize === "xs"
                  ? selectQty(product.countInStock.xs)
                  : chosenSize === "s"
                  ? selectQty(product.countInStock.s)
                  : chosenSize === "m"
                  ? selectQty(product.countInStock.m)
                  : chosenSize === "l"
                  ? selectQty(product.countInStock.l)
                  : chosenSize === "xl"
                  ? selectQty(product.countInStock.xl)
                  : chosenSize === "xxl" && selectQty(product.countInStock.xxl)
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
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
