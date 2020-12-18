import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { signout } from "../actions/userActions";
import { emptyCart } from "../actions/cartActions";
import ProductsTable from "../components/ProductsTable";
import OrdersTable from "../components/OrdersTable";

export default function AdminScreen(props) {
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
      <OrdersTable props={props} />
      <ProductsTable props={props} />
    </section>
  );
}
