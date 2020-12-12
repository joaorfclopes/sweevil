import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { PayPalButton } from "react-paypal-button-v2";
import {
  cancelOrder,
  deliverOrder,
  detailsOrder,
  payOrder,
} from "../actions/orderActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import LazyImage from "../components/LazyImage";
import Axios from "axios";
import {
  ORDER_CANCEL_RESET,
  ORDER_DELIVER_RESET,
  ORDER_PAY_RESET,
} from "../constants/orderConstants";

export default function OrderScreen(props) {
  const dispatch = useDispatch();
  const orderId = props.match.params.id;

  const [sdkReady, setSdkReady] = useState(false);

  const orderDetails = useSelector((state) => state.orderDetails);
  const { loading, order, error } = orderDetails;
  const orderPay = useSelector((state) => state.orderPay);
  const {
    loading: loadingPay,
    success: successPay,
    error: errorPay,
  } = orderPay;
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const orderDeliver = useSelector((state) => state.orderDeliver);
  const {
    loading: loadingDeliver,
    success: successDeliver,
    error: errorDeliver,
  } = orderDeliver;
  const orderCancel = useSelector((state) => state.orderCancel);
  const {
    loading: loadingCancel,
    success: successCancel,
    error: errorCancel,
  } = orderCancel;

  useEffect(() => {
    const addPaypalScript = async () => {
      const { data } = await Axios.get("/api/config/paypal");
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `https://www.paypal.com/sdk/js?client-id=${data}&currency=EUR`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };
    if (
      !order ||
      successPay ||
      successDeliver ||
      successCancel ||
      (order && order._id !== orderId)
    ) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch({ type: ORDER_CANCEL_RESET });
      dispatch(detailsOrder(orderId));
    } else {
      if (!order.isPaid) {
        if (!window.paypal) {
          addPaypalScript();
        } else {
          setSdkReady(true);
        }
      }
    }
  }, [
    dispatch,
    orderId,
    order,
    sdkReady,
    successPay,
    successDeliver,
    successCancel,
  ]);

  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(order, paymentResult));
  };

  const deliverHandler = () => {
    if (window.confirm(`Deliver order ${order._id}?`)) {
      dispatch(deliverOrder(order._id));
    }
  };

  const cancelHandler = () => {
    if (window.confirm(`Cancel order ${order._id}?`)) {
      dispatch(cancelOrder(order._id));
    }
  };

  return (
    <section className="order cards-section">
      {loading ? (
        <LoadingBox lineHeight="70vh" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <>
          <h1>Order {order._id}</h1>
          {loadingDeliver && <LoadingBox />}
          {errorDeliver && (
            <MessageBox variant="danger">{errorDeliver}</MessageBox>
          )}
          {loadingCancel && <LoadingBox />}
          {errorCancel && (
            <MessageBox variant="error">{errorCancel}</MessageBox>
          )}
          {order.status === "CANCELED" ? (
            <div style={{ marginBottom: "0.5rem" }}>
              <MessageBox variant="error">Order Canceled.</MessageBox>
            </div>
          ) : (
            order.status === "DELIVERED" && (
              <div style={{ marginBottom: "0.5rem" }}>
                <MessageBox variant="success">Order Delivered.</MessageBox>
              </div>
            )
          )}
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
              ) : {order.itemsPrice.toFixed(2)}€
            </p>
            <p>Shipping : {order.shippingPrice.toFixed(2)}€</p>
            <h3 className="total">Total : {order.totalPrice.toFixed(2)}€</h3>
          </div>
          {order.status !== "CANCELED" && !order.isPaid && (
            <div className="paypal-button">
              {!sdkReady ? (
                <LoadingBox />
              ) : (
                <>
                  {errorPay && (
                    <MessageBox variant="danger">{errorPay}</MessageBox>
                  )}
                  {loadingPay && <LoadingBox />}
                  <PayPalButton
                    currency="EUR"
                    amount={order.totalPrice}
                    onSuccess={successPaymentHandler}
                  />
                </>
              )}
            </div>
          )}
          {userInfo &&
            userInfo.isAdmin &&
            order.isPaid &&
            !order.isDelivered &&
            order.status !== "CANCELED" && (
              <div className="deliver-button full-width">
                <button className="primary" onClick={deliverHandler}>
                  Deliver Order
                </button>
              </div>
            )}
          {order.status !== "CANCELED" && !order.isDelivered && (
            <div className={`cancel-button ${order.isPaid && "full-width"}`}>
              <button className="dangerous" onClick={cancelHandler}>
                Cancel Order
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
