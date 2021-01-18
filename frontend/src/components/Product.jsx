import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import $ from "jquery";
import Placeholder from "./Placeholder";

export default function Product(props) {
  const { product } = props;

  const [hidePlaceholder, setHidePlaceholder] = useState(false);

  const imageLoaded = (id) => {
    $(`#${id}-product-img`).addClass("show");
    $(`#${id}-product-name`).addClass("show");
    $(`#${id}-product-line`).addClass("show");
    $(`#${id}-product-price`).addClass("show");
    setHidePlaceholder(true);
  };

  return (
    <div className="product" key={product._id}>
      <Link to={`/shop/product/${product._id}`}>
        <div className="product-body">
          <Placeholder>
            <div id={`${product._id}-product-img`} className="product-image">
              <LazyLoadImage
                src={product.images[0]}
                alt={product.image}
                afterLoad={() => imageLoaded(product._id)}
              />
            </div>
          </Placeholder>
          <div className="product-description">
            <Placeholder hide={hidePlaceholder}>
              <p id={`${product._id}-product-name`} className="product-name">
                {product.name}
              </p>
              <div id={`${product._id}-product-line`} className="line"></div>
            </Placeholder>
            <Placeholder hide={hidePlaceholder}>
              <p id={`${product._id}-product-price`} className="product-price">
                {product.price && product.price.toFixed(2)}€
              </p>
            </Placeholder>
          </div>
        </div>
      </Link>
    </div>
  );
}
