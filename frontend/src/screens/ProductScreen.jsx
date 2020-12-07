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
    <section className="product-screen" style={{ marginTop: "6vw" }}>
      {loading ? (
        <LoadingBox lineHeight="70vh" width="100px" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <div className="container">
          <div className="row-bootstrap">
            <div className="col-md-2"></div>
            <div className="col-md-5">
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
                {product.images.map((image) => (
                  <div key={image} className="image-preview">
                    <LazyImage
                      src={image}
                      className="d-block w-100"
                      alt="product"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="col-md-5">
              <h2>
                <b>{product.name}</b>
              </h2>
              <p className="price">
                {product.finalPrice
                  ? product.finalPrice.toFixed(2)
                  : product.finalPrice}
                €
              </p>
              <p>
                <b>Availability:</b> <span className="stock"></span>
              </p>
              <p>
                <b>Category:</b> {product.category}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
