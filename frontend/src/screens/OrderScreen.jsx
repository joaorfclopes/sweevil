import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { PayPalButton } from "react-paypal-button-v2";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import $ from "jquery";
import {
  cancelOrder,
  deliverOrder,
  detailsOrder,
  payOrder,
} from "../actions/orderActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Axios from "axios";
import {
  ORDER_CANCEL_RESET,
  ORDER_DELIVER_RESET,
  ORDER_PAY_RESET,
} from "../constants/orderConstants";
import PlaceHolder from "../components/Placeholder";

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
    Swal.fire({
      title: `Deliver Order?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deliverOrder(order._id));
        Swal.fire("Delivered!", "", "success");
      }
    });
  };

  const cancelHandler = () => {
    Swal.fire({
      title: `Cancel Order?`,
      showConfirmButton: false,
      showDenyButton: true,
      showCancelButton: true,
      denyButtonText: "Yes",
    }).then((result) => {
      if (result.isDenied) {
        dispatch(cancelOrder(order._id));
        Swal.fire("Canceled!", "", "error");
      }
    });
  };

  const imageLoaded = (id) => {
    $(`#${id}-order-img`).addClass("show");
  };

  return (
    <motion.section
      className="order cards-section"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      {loading ? (
        <LoadingBox lineHeight="75vh" width="100px" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <>
          <h1>Order {order._id}</h1>
          {loadingDeliver && <LoadingBox />}
          {errorDeliver && (
            <MessageBox variant="error">{errorDeliver}</MessageBox>
          )}
          {loadingCancel && <LoadingBox />}
          {errorCancel && (
            <MessageBox variant="error">{errorCancel}</MessageBox>
          )}
          {order.status === "PAID" && (
            <div style={{ marginBottom: "0.5rem" }}>
              <MessageBox variant="success">
                Order successfully paid! Check your email Inbox (if you can't
                find it check your Spam) for more information.
              </MessageBox>
            </div>
          )}
          {order.status === "CANCELED" && (
            <div style={{ marginBottom: "0.5rem" }}>
              <MessageBox variant="error">Order canceled.</MessageBox>
            </div>
          )}
          {order.status === "DELIVERED" && (
            <div style={{ marginBottom: "0.5rem" }}>
              <MessageBox variant="success">Order delivered!</MessageBox>
            </div>
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
                    <PlaceHolder height="100%">
                      <div
                        id={`${item.product}-order-img`}
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
                      <p>{item.name}</p>
                    </div>
                    <div className="item-price">
                      <p>{item.price && item.price.toFixed(2)}€</p>
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
              ) : {order.itemsPrice && order.itemsPrice.toFixed(2)}€
            </p>
            <p>
              Shipping : {order.shippingPrice && order.shippingPrice.toFixed(2)}
              €
            </p>
            <h3 className="total">
              Total : {order.totalPrice && order.totalPrice.toFixed(2)}€
            </h3>
          </div>
          {order.status !== "CANCELED" && !order.isPaid && (
            <div className="paypal-button">
              {!sdkReady ? (
                <LoadingBox />
              ) : (
                <>
                  {errorPay && (
                    <MessageBox variant="error">{errorPay}</MessageBox>
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
    </motion.section>
  );
}
