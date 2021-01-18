import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import $ from "jquery";
import Placeholder from "./Placeholder";

export default function Product(props) {
  const { product } = props;

  const [hidePlaceholder, setHidePlaceholder] = useState(false);

  const imageLoaded = (id) => {
    $(`#${id}-img`).addClass("show");
    $(`#${id}-name`).addClass("show");
    $(`#${id}-line`).addClass("show");
    $(`#${id}-price`).addClass("show");
    setHidePlaceholder(true);
  };

  return (
    <div className="product" key={product._id}>
      <Link to={`/shop/product/${product._id}`}>
        <div className="product-body">
          <Placeholder>
            <div id={`${product._id}-img`} className="product-image">
              <LazyLoadImage
                src={product.images[0]}
                alt={product.image}
                afterLoad={() => imageLoaded(product._id)}
              />
            </div>
          </Placeholder>
          <div className="product-description">
            <Placeholder hide={hidePlaceholder}>
              <p id={`${product._id}-name`} className="product-name">
                {product.name}
              </p>
              <div id={`${product._id}-line`} className="line"></div>
            </Placeholder>
            <Placeholder hide={hidePlaceholder}>
              <p id={`${product._id}-price`} className="product-price">
                {product.price && product.price.toFixed(2)}€
              </p>
            </Placeholder>
          </div>
        </div>
      </Link>
    </div>
  );
}
