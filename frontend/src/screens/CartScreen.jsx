import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import MessageBox from "../components/MessageBox";
import LazyImage from "../components/LazyImage";
import { sizes } from "../utils";
import { addToCart, removeFromCart } from "../actions/cartActions";
import { Notyf } from "notyf";

export default function CartScreen() {
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
    notyf.success("Product size updated");
  };

  const changeQty = (id, qty, size) => {
    dispatch(addToCart(id, Number(qty), size));
    notyf.success("Product quantity updated");
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
    notyf.error("Product removed from cart");
  };

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
        <ul>
          {cartItems.map((item) => (
            <li key={item.product}>
              <div className="item-image">
                <LazyImage className="small" src={item.image} alt={item.name} />
              </div>
              <div className="item-name">
                <Link to={`/shop/product/${item.product}`}>{item.name}</Link>
              </div>
              {item.isClothing && (
                <div>
                  <select
                    value={item.size}
                    onChange={(e) => changeSize(item.product, e.target.value)}
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
              <div>
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
                    : item.size === "xxl" && qtyOption(item.countInStock.xxl)}
                </select>
              </div>
              <div>{item.price ? item.price.toFixed(2) : item.price}€</div>
              <div>
                <button
                  type="button"
                  onClick={() => removeFromCartHandler(item.product)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
