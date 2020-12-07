import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { detailsProduct } from "../actions/productActions";
import LazyImage from "../components/LazyImage";

export default function ProductScreen(props) {
  const dispatch = useDispatch();
  const productId = props.match.params.id;
  const productDetails = useSelector((state) => state.productDetails);
  const { loading, product, error } = productDetails;

  useEffect(() => {
    dispatch(detailsProduct(productId));
  }, [dispatch, productId]);

  return (
    <section className="product-screen row center" style={{ marginTop: "3vw" }}>
      {loading ? (
        <LoadingBox lineHeight="70vh" width="100px" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <div className="container">
          <div className="row-bootstrap">
            <div className="col-md-2"></div>
            <div className="col-md-5 product-images">
              <div
                id="productImageCarousel"
                className="carousel slide"
                data-interval="false"
              >
                <div className="carousel-inner">
                  {product.images.map((image) => (
                    <div
                      key={image}
                      className={`carousel-item ${
                        image === product.images[0] && "active"
                      }`}
                    >
                      <LazyImage
                        src={image}
                        className="d-block w-100"
                        alt="product"
                      />
                    </div>
                  ))}
                </div>
                <a
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
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
