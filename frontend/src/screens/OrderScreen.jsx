import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { detailsOrder } from "../actions/orderActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import LazyImage from "../components/LazyImage";

export default function OrderScreen(props) {
  const dispatch = useDispatch();
  const orderId = props.match.params.id;

  const orderDetails = useSelector((state) => state.orderDetails);
  const { loading, order, error } = orderDetails;

  useEffect(() => {
    dispatch(detailsOrder(orderId));
  }, [dispatch, orderId]);

  return (
    <section className="order cards-section">
      {loading ? (
        <LoadingBox lineHeight="70vh" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <>
          <h1>Order {order._id}</h1>
          <div className="card">
            <h3>Shipping Address</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}</p>
            <p>{order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
          <div className="card">
            <h3>Contact Information</h3>
            <p>{order.shippingAddress.email}</p>
            <p>{order.shippingAddress.phoneNumber}</p>
          </div>
          <div className="card">
            <h3>Items</h3>
            <ul className="cart-items">
              {order.orderItems.map((item, index) => (
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
                    {item.size !== "" && (
                      <div className="item-size">Size: {item.size}</div>
                    )}
                    <div className="item-qty">
                      <p>Quantity: {item.qty}</p>
                    </div>
                  </div>
                  {order.orderItems[index + 1] && <hr />}
                </li>
              ))}
            </ul>
          </div>
          <div className="card total-amount">
            <p>
              Subtotal ({order.itemsQty} {order.itemsQty > 1 ? "items" : "item"}
              ) : {order.subtotalPrice.toFixed(2)}€
            </p>
            <p>Shipping : {order.shippingPrice.toFixed(2)}€</p>
            <h3 className="total">Total : {order.totalPrice.toFixed(2)}€</h3>
          </div>
        </>
      )}
    </section>
  );
}
