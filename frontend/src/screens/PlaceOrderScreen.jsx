import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import LazyImage from "../components/LazyImage";
import { toPrice } from "../utils";

export default function PlaceOrderScreen(props) {
  const cart = useSelector((state) => state.cart);
  const { cartItems, shippingAddress } = cart;

  if (cartItems.length <= 0) {
    props.history.push("/cart");
  }

  cart.itemsQty = cartItems.reduce((a, c) => a + c.qty, 0);
  cart.subtotalPrice = toPrice(
    cartItems.reduce((a, c) => a + c.price * c.qty, 0)
  );
  cart.shippingPrice = cart.subtotalPrice > 50 ? toPrice(0) : toPrice(9.99);
  cart.totalPrice = toPrice(cart.subtotalPrice + cart.shippingPrice);

  return (
    <section className="place-order">
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
                  <LazyImage
                    className="small"
                    src={item.image}
                    alt={item.name}
                  />
                </Link>
              </div>
              <div className="item-content">
                <div className="item-name">
                  <p>{item.name}</p>
                </div>
                <div className="item-price">
                  <p>{item.price.toFixed(2)}€</p>
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
          {cart.subtotalPrice.toFixed(2)}€
        </p>
        <p>Shipping : {cart.shippingPrice.toFixed(2)}€</p>
        <h3 className="total">Total : {cart.totalPrice.toFixed(2)}€</h3>
      </div>
      <button className="primary">Place Order</button>
    </section>
  );
}
