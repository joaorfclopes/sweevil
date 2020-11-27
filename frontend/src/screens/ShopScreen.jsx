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
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <div className="shop" style={{ marginTop: "4vw" }}>
          <div className="row center">
            {products.map(
              (product) =>
                product.image &&
                product.name &&
                product.finalPrice && (
                  <Product key={product._id} product={product} />
                )
            )}
          </div>
        </div>
      )}
    </section>
  );
}
