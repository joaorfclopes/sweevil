import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { toPrice } from "../utils";
import { createOrder } from "../actions/orderActions";
import { ORDER_CREATE_RESET } from "../constants/orderConstants";

export default function PlaceOrderScreen(props) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { cartItems, shippingAddress } = cart;
  const orderCreate = useSelector((state) => state.orderCreate);
  const { success, order } = orderCreate;

  if (cartItems.length <= 0) {
    props.history.push("/cart");
  }

  cart.itemsQty = cartItems.reduce((a, c) => a + c.qty, 0);
  cart.itemsPrice = toPrice(cartItems.reduce((a, c) => a + c.price * c.qty, 0));
  cart.shippingPrice = cart.itemsPrice > 50 ? toPrice(0) : toPrice(9.99);
  cart.totalPrice = toPrice(cart.itemsPrice + cart.shippingPrice);

  const placeOrderHandler = () => {
    dispatch(
      createOrder({
        ...cart,
        orderItems: cartItems,
        status: "IN PROGRESS",
      })
    );
  };

  useEffect(() => {
    if (success) {
      props.history.push(`/cart/order/${order._id}`);
      dispatch({ type: ORDER_CREATE_RESET });
    }
  }, [success, props, order, dispatch]);

  return (
    <motion.section
      className="place-order cards-section"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <h1>Place Order</h1>
      <div className="card">
        <h3>Shipping Address</h3>
        <p>{shippingAddress.fullName}</p>
        <p>{shippingAddress.address}</p>
        <p>{shippingAddress.city}</p>
        <p>{shippingAddress.postalCode}</p>
        <p>{shippingAddress.country}</p>
      </div>
      <div className="card">
        <h3>Contact Information</h3>
        <p>{shippingAddress.email}</p>
        <p>{shippingAddress.phoneNumber}</p>
      </div>
      <div className="card">
        <h3>Items</h3>
        <ul className="cart-items">
          {cartItems.map((item, index) => (
            <li key={item.product}>
              <div className="item-image">
                <Link to={`/shop/product/${item.product}`}>
                  <LazyLoadImage
                    className="small"
                    src={item.image}
                    alt={item.name}
                    effect="blur"
                  />
                </Link>
              </div>
              <div className="item-content">
                <div className="item-name">
                  <p>{item.name}</p>
                </div>
                <div className="item-price">
                  <p>{item.price && item.price.toFixed(2)}€</p>
                </div>
              </div>
              <div className="item-content">
                {item.isClothing && (
                  <div className="item-size">
                    <p>Size: {item.size}</p>
                  </div>
                )}
                <div className="item-qty">
                  <p>Quantity: {item.qty}</p>
                </div>
              </div>
              {cartItems[index + 1] && <hr />}
            </li>
          ))}
        </ul>
      </div>
      <div className="card total-amount">
        <p>
          Subtotal ({cart.itemsQty} {cart.itemsQty > 1 ? "items" : "item"}) :{" "}
          {cart.itemsPrice && cart.itemsPrice.toFixed(2)}€
        </p>
        <p>Shipping : {cart.shippingPrice && cart.shippingPrice.toFixed(2)}€</p>
        <h3 className="total">
          Total : {cart.totalPrice && cart.totalPrice.toFixed(2)}€
        </h3>
      </div>
      <button className="primary" onClick={placeOrderHandler}>
        Place Order
      </button>
    </motion.section>
  );
}
