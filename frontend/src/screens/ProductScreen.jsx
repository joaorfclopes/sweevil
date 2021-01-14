import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Notyf } from "notyf";
import Swipe from "react-easy-swipe";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { detailsProduct } from "../actions/productActions";
import { addToCart } from "../actions/cartActions";
import LazyImage from "../components/LazyImage";
import { isMobile, sizes } from "../utils";
import Modal from "../components/Modal";

export default function ProductScreen(props) {
  const dispatch = useDispatch();
  const productId = props.match.params.id;
  const productDetails = useSelector((state) => state.productDetails);
  const { loading, product, error } = productDetails;
  const [qty, setQty] = useState(1);
  const [chosenSize, setChosenSize] = useState("");
  const notyf = new Notyf();
  const [openModal, setOpenModal] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
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
      <span style={{ color: "red" }}>Out of Stock</span>
    );
  };

  const addToCartHandler = async () => {
    dispatch(addToCart(productId, qty, chosenSize));
    notyf
      .success({
        icon: false,
        message: `${product.name} added <b>to cart</b>`,
      })
      .on("click", () => {
        props.history.push("/cart");
      });
  };

  const handleOpenModal = (index) => {
    setOpenModal(true);
    setImgIndex(index);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const next = () => {
    document.getElementById("carousel-control-next").click();
  };

  const previous = () => {
    document.getElementById("carousel-control-prev").click();
  };

  return (
    <section className="product-screen row center">
      {loading ? (
        <LoadingBox lineHeight="70vh" width="100px" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <div className="container">
          <div className="row-bootstrap">
            <div className="col-md-1"></div>
            <div className="col-md-5 product-images">
              <div
                id="productImageCarousel"
                className={`carousel ${isMobile() && "slide"}`}
                data-interval="false"
              >
                <div className="carousel-inner" style={{ marginBottom: "5px" }}>
                  {product.images.map((image, index) => (
                    <div
                      key={image}
                      className={`carousel-item ${
                        image === product.images[0] && "active"
                      }`}
                      onClick={() => handleOpenModal(index)}
                    >
                      <Swipe
                        style={{ cursor: "pointer" }}
                        onSwipeRight={previous}
                        onSwipeLeft={next}
                      >
                        <LazyImage
                          src={image}
                          className="d-block w-100"
                          alt="product"
                        />
                      </Swipe>
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
                    <LazyImage
                      src={image}
                      className="d-block w-100"
                      alt="product"
                    />
                  </div>
                ))}
              </div>
            </div>
            <Modal
              open={openModal}
              handleClose={handleCloseModal}
              images={product.images}
              imgIndex={imgIndex}
              noMobile
            />
            <div className="col-md-5 product-details">
              <h2 className="name">
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
                {product.isClothing && !chosenSize && (
                  <select>
                    <option value={qty}>{qty}</option>
                  </select>
                )}
                {!product.isClothing
                  ? selectQty(product.countInStock.stock)
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
                  : chosenSize === "xxl" && selectQty(product.countInStock.xxl)}
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
        </div>
      )}
    </section>
  );
}
