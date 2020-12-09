import React, { useEffect } from "react";
import Product from "../components/Product";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { useDispatch, useSelector } from "react-redux";
import { listProducts } from "../actions/productActions";

export default function ShopScreen() {
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.productList);
  const { loading, products, error } = productList;

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  return (
    <section>
      {loading ? (
        <LoadingBox lineHeight="70vh" width="100px" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <div className="shop">
          <div className="row center" style={{ minHeight: "70vh" }}>
            {products &&
              products.map(
                (product) =>
                  product.images[0] &&
                  product.name &&
                  product.price && (
                    <Product key={product._id} product={product} />
                  )
              )}
          </div>
        </div>
      )}
    </section>
  );
}
