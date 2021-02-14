import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { signout } from "../actions/userActions";
import ProductsTable from "../components/ProductsTable";
import OrdersTable from "../components/OrdersTable";
import { scrollTop } from "../utils.js";

export default function AdminScreen(props) {
  const dispatch = useDispatch();

  const signoutHandler = () => {
    dispatch(signout());
  };

  useEffect(() => {
    scrollTop();
  }, []);

  return (
    <motion.section
      className="admin-screen"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <div className="logout-container">
        <Link to="/">
          <button className="primary" onClick={signoutHandler}>
            Log Out
          </button>
        </Link>
      </div>
      <OrdersTable props={props} />
      <ProductsTable props={props} />
    </motion.section>
  );
}
