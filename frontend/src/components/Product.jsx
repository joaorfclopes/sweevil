import React from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function Product(props) {
  const { product } = props;

  return (
    <div className="product" key={product._id}>
      <Link to={`/shop/product/${product._id}`}>
        <div className="product-body">
          <div className="product-image">
            <LazyLoadImage
              src={product.images[0]}
              alt={product.image}
              effect="blur"
              placeholderSrc="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mPcvQkAAi4Bb27G3QcAAAAASUVORK5CYII="
            />
          </div>
          <div className="product-description">
            <p className="product-name">{product.name}</p>
            <div className="line"></div>
            <p className="product-price">
              {product.price && product.price.toFixed(2)}€
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
