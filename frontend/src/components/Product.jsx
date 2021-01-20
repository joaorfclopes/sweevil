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
    $(`#${id}-name-line`).addClass("show");
    $(`#${id}-price`).addClass("show");
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
            <Placeholder height="100%" hide={hidePlaceholder} text>
              <div
                id={`${product._id}-name-line`}
                className="name-line-placeholder"
              >
                <p className="product-name">{product.name}</p>
                <div className="line"></div>
              </div>
            </Placeholder>
            <Placeholder height="100%" hide={hidePlaceholder} text>
              <div id={`${product._id}-price`} className="price-placeholder">
                <p className="product-price">
                  {product.price && product.price.toFixed(2)}€
                </p>
              </div>
            </Placeholder>
          </div>
        </div>
      </Link>
    </div>
  );
}
