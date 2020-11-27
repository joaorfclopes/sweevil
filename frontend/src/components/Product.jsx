import React from "react";
import { Link } from "react-router-dom";

export default function Product(props) {
  const { product } = props;
  return (
    <div className="product" key={product._id}>
      <Link to={`/product/${product._id}`}>
        <div className="product-body">
          <div
            className="product-image"
            style={{ backgroundImage: `url(${product.image})` }}
          ></div>
          <div className="product-description">
            <p className="product-name">{product.name}</p>
            <div className="line"></div>
            <p className="product-name">
              {product.finalPrice
                ? product.finalPrice.toFixed(2)
                : product.finalPrice}
              €
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
