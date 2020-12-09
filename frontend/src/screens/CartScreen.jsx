import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import MessageBox from "../components/MessageBox";

export default function CartScreen(props) {
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  return (
    <section className="cart">
      <h1>Cart</h1>
      {cartItems.length === 0 ? (
        <div>
          <MessageBox>
            Cart is empty. <Link to="/shop">Click here</Link> to go shopping.
          </MessageBox>
        </div>
      ) : (
        <ul></ul>
      )}
    </section>
  );
}
