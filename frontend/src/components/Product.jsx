import React from "react";
import { Link } from "react-router-dom";

export default function Product(props) {
  const { product } = props;
  return (
    <div className="product" key={product._id}>
      <Link to={`/product/${product._id}`}>
        <div className="product-body">
          <div className="product-image">
            <img className="medium" src={product.image} alt="product" />
          </div>
          <div className="product-description">
            <p className="product-name">{product.name}</p>
            <hr />
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
