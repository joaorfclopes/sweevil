import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import ProductsTable from "../components/ProductsTable";
import { signout } from "../actions/userActions";
import { emptyCart } from "../actions/cartActions";

export default function AdminScreen() {
  const dispatch = useDispatch();

  const signoutHandler = () => {
    dispatch(signout());
    dispatch(emptyCart());
  };

  return (
    <section className="admin-screen">
      <div className="logout-container">
        <Link to="/">
          <button className="primary" onClick={signoutHandler}>
            Log Out
          </button>
        </Link>
      </div>
      <ProductsTable />
    </section>
  );
}
