import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import $ from "jquery";
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

  const openLarge = (image) => {
    $(".large").attr("src", image);
  };

  return (
    <section className="row center" style={{ marginTop: "5vw" }}>
      {loading ? (
        <LoadingBox lineHeight="70vh" width="100px" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <div className="product-screen">
          <div className="product-images">
            <LazyImage
              className="large"
              src={product.images[0]}
              alt={product.name}
            />
            {product.images &&
              product.images.map((image) => (
                <span key={image} onClick={() => openLarge(image)}>
                  <LazyImage className="small" src={image} alt={product.name} />
                </span>
              ))}
          </div>
          <div className="product-details">
            <ul>
              <li>{product.name}</li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
