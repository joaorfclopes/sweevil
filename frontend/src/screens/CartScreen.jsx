import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Notyf } from "notyf";
import { motion } from "framer-motion";
import $ from "jquery";
import MessageBox from "../components/MessageBox";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { sizes, toPrice } from "../utils";
import { addToCart, removeFromCart } from "../actions/cartActions";
import { ReactComponent as Remove } from "../assets/svg/remove.svg";
import PlaceHolder from "../components/Placeholder";

export default function CartScreen(props) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  const notyf = new Notyf();

  const sizeOption = (size, val) => {
    return (
      val > 0 && (
        <option key={size} value={size}>
          {size}
        </option>
      )
    );
  };

  const qtyOption = (val) => {
    return [...Array(val >= 5 ? 5 : val).keys()].map((x) => (
      <option key={x + 1} value={x + 1}>
        {x + 1}
      </option>
    ));
  };

  const changeSize = (id, size) => {
    dispatch(addToCart(id, 1, String(size)));
    notyf.success({
      icon: false,
      message: "Product size updated",
    });
  };

  const changeQty = (id, qty, size) => {
    dispatch(addToCart(id, Number(qty), size));
    notyf.success({
      icon: false,
      message: "Product quantity updated",
    });
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
    notyf.error({
      icon: false,
      message: "Product removed from cart",
    });
  };

  cart.itemsQty = cartItems.reduce((a, c) => a + c.qty, 0);
  cart.itemsPrice = toPrice(cartItems.reduce((a, c) => a + c.price * c.qty, 0));
  cart.shippingPrice = cart.itemsPrice > 50 ? toPrice(0) : toPrice(9.99);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice;

  const checkoutHandler = () => {
    props.history.push("/cart/shipping");
  };

  const imageLoaded = (id) => {
    $(`#${id}-cart-img`).addClass("show");
  };

  return (
    <motion.section
      className="cart"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <h1 className="custom-font">Cart</h1>
      {cartItems.length === 0 ? (
        <div>
          <MessageBox>
            Cart is empty. <Link to="/shop">Click here</Link> to go shopping.
          </MessageBox>
        </div>
      ) : (
        <>
          <ul className="cart-items">
            {cartItems.map((item) => (
              <li key={item.product}>
                <div className="item-image">
                  <PlaceHolder height="100%">
                    <div
                      id={`${item.product}-cart-img`}
                      className="item-image-inner"
                    >
                      <Link to={`/shop/product/${item.product}`}>
                        <LazyLoadImage
                          className="small"
                          src={item.image}
                          alt={item.name}
                          afterLoad={() => imageLoaded(item.product)}
                        />
                      </Link>
                    </div>
                  </PlaceHolder>
                </div>
                <div className="item-content">
                  <div className="item-name">
                    <h3>{item.name}</h3>
                  </div>
                  <div className="item-price">
                    <h3>{item.price && item.price.toFixed(2)}€</h3>
                  </div>
                </div>
                <div className="item-content">
                  {item.isClothing && (
                    <div className="item-size">
                      <span>Size:</span>{" "}
                      <select
                        value={item.size}
                        onChange={(e) =>
                          changeSize(item.product, e.target.value)
                        }
                      >
                        {sizes.map((size) =>
                          size === "xs"
                            ? sizeOption(size, item.countInStock.xs)
                            : size === "s"
                            ? sizeOption(size, item.countInStock.s)
                            : size === "m"
                            ? sizeOption(size, item.countInStock.m)
                            : size === "l"
                            ? sizeOption(size, item.countInStock.l)
                            : size === "xl"
                            ? sizeOption(size, item.countInStock.xl)
                            : size === "xxl" &&
                              sizeOption(size, item.countInStock.xxl)
                        )}
                      </select>
                    </div>
                  )}
                  <div className="item-qty">
                    <span>Quantity:</span>{" "}
                    <select
                      value={item.qty}
                      onChange={(e) =>
                        changeQty(item.product, e.target.value, item.size)
                      }
                    >
                      {!item.isClothing
                        ? qtyOption(item.countInStock.stock)
                        : item.size === "xs"
                        ? qtyOption(item.countInStock.xs)
                        : item.size === "s"
                        ? qtyOption(item.countInStock.s)
                        : item.size === "m"
                        ? qtyOption(item.countInStock.m)
                        : item.size === "l"
                        ? qtyOption(item.countInStock.l)
                        : item.size === "xl"
                        ? qtyOption(item.countInStock.xl)
                        : item.size === "xxl" &&
                          qtyOption(item.countInStock.xxl)}
                    </select>
                  </div>
                  <div className="item-remove">
                    <Remove
                      className="icon"
                      onClick={() => removeFromCartHandler(item.product)}
                    />
                    <button
                      className="secondary"
                      onClick={() => removeFromCartHandler(item.product)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="line"></div>
              </li>
            ))}
          </ul>
          <ul className="cart-total">
            <li>
              Subtotal ({cart.itemsQty} {cart.itemsQty > 1 ? "items" : "item"})
              : {cart.itemsPrice && cart.itemsPrice.toFixed(2)}€
            </li>
            <li>
              Shipping : {cart.shippingPrice && cart.shippingPrice.toFixed(2)}€
            </li>
            <li>
              <h2>Total : {cart.totalPrice && cart.totalPrice.toFixed(2)}€</h2>
            </li>
            <li>
              <button className="primary" onClick={checkoutHandler}>
                Checkout
              </button>
            </li>
          </ul>
        </>
      )}
    </motion.section>
  );
}
