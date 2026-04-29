import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import $ from "jquery";
import Placeholder from "./Placeholder";

function isSoldOut(product) {
  const s = product.countInStock;
  if (!s) return true;
  if (product.isClothing) {
    return ["xs", "s", "m", "l", "xl", "xxl"].every((sz) => !s[sz] || s[sz] <= 0);
  }
  return !s.stock || s.stock <= 0;
}

export default function Product(props) {
  const { product } = props;
  const soldOut = isSoldOut(product);

  const [hidePlaceholder, setHidePlaceholder] = useState(false);

  const imageLoaded = (id) => {
    $(`#${id}-product-img`).addClass("show");
    $(`#${id}-product-desc`).addClass("show");
    setHidePlaceholder(true);
  };

  return (
    <div className="product" key={product._id}>
      <Link to={`/shop/product/${product._id}`}>
        <div className="product-body">
          {soldOut && <span className="sold-out-pill">Sold Out</span>}
          <Placeholder>
            <div id={`${product._id}-product-img`} className="product-image">
              <LazyLoadImage
                src={product.images[0]}
                alt={product.image}
                afterLoad={() => imageLoaded(product._id)}
              />
            </div>
          </Placeholder>
          <Placeholder height="100%" hide={hidePlaceholder} text>
            <div
              id={`${product._id}-product-desc`}
              className="product-description"
            >
              <p className="product-name">{product.name}</p>
              <div className="line"></div>
              <p className="product-price">
                {product.price && product.price.toFixed(2)}€
              </p>
            </div>
          </Placeholder>
        </div>
      </Link>
    </div>
  );
}
