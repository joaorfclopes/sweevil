import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Product from "../components/Product";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { useDispatch, useSelector } from "react-redux";
import { listProducts } from "../actions/productActions";
import { scrollTop } from "../utils.js";

export default function ShopScreen(props) {
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.productList);
  const { loading, products, error } = productList;

  useEffect(() => {
    scrollTop();
    dispatch(listProducts());
  }, [dispatch]);

  return (
    <motion.section
      className="shop"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <div className="row center shop-container">
        {loading ? (
          <LoadingBox lineHeight="75vh" width="100px" />
        ) : error ? (
          <MessageBox variant="error">{error}</MessageBox>
        ) : (
          products &&
          products.map(
            (product) =>
              product.visible &&
              product.images[0] &&
              product.name &&
              product.price && <Product key={product._id} product={product} />
          )
        )}
      </div>
    </motion.section>
  );
}
