import React from "react";
import { Link } from "react-router-dom";
import LazyImage from "./LazyImage";

export default function Product(props) {
  const { product } = props;

  return (
    <div className="product" key={product._id}>
      <Link to={`/shop/product/${product._id}`}>
        <div className="product-body">
          <div className="product-image">
            <LazyImage src={product.images[0]} alt={product.image} />
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
