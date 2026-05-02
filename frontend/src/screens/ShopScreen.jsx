import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Product from "../components/Product";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { useDispatch, useSelector } from "react-redux";
import { listProducts } from "../actions/productActions";
import { listProductCategories } from "../actions/productCategoryActions";
import { scrollTop } from "../utils.js";

export default function ShopScreen(props) {
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.productList);
  const { loading, products, error } = productList;
  const { categories = [] } = useSelector((state) => state.productCategoryList);

  const [selectedCategory, setSelectedCategory] = useState("*");

  useEffect(() => {
    scrollTop();
    dispatch(listProducts());
    dispatch(listProductCategories());
  }, [dispatch]);

  const visibleProducts = (products || []).filter(
    (p) => p.images[0] && p.name && p.price && p.visible !== false
  );

  const categoriesInUse = categories.filter((cat) =>
    visibleProducts.some((p) => p.category === cat.name)
  );

  const filtered =
    selectedCategory === "*"
      ? visibleProducts
      : visibleProducts.filter((p) => p.category === selectedCategory);

  return (
    <motion.section
      className="shop"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <div className="shop-container">
        {categoriesInUse.length > 0 && (
          <div className="filters">
            <div
              className={`filter${selectedCategory === "*" ? " active" : ""}`}
              onClick={() => setSelectedCategory("*")}
            >
              All
            </div>
            {categoriesInUse.map((cat) => (
              <div
                key={cat._id}
                className={`filter${selectedCategory === cat.name ? " active" : ""}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name}
              </div>
            ))}
          </div>
        )}
        <div className="row center">
          {loading ? (
            <LoadingBox lineHeight="75vh" width="100px" />
          ) : error ? (
            <MessageBox variant="error">{error}</MessageBox>
          ) : (
            filtered.map((product) => (
              <Product key={product._id} product={product} />
            ))
          )}
        </div>
      </div>
      <div className="free-shipping-banner">
        Free shipping on orders over €40
      </div>
    </motion.section>
  );
}
