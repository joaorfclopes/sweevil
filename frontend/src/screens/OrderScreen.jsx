import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import $ from "jquery";
import {
  cancelOrder,
  sendOrder,
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
  ORDER_SEND_RESET,
} from "../constants/orderConstants";
import PlaceHolder from "../components/Placeholder";
import { getTax } from "../config/taxRates";

function StripeCheckoutForm({ order, dispatch, token }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [stripeError, setStripeError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setStripeError("");
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (error) {
      setStripeError(error.message);
      setPaying(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      dispatch(payOrder(order, { paymentIntentId: paymentIntent.id, confirmToken: token }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {stripeError && (
        <MessageBox variant="error">{stripeError}</MessageBox>
      )}
      <button
        type="submit"
        disabled={!stripe || paying}
        className="primary"
        style={{ marginTop: "1rem", width: "100%" }}
      >
        {paying ? "Processing..." : `Pay €${order.totalPrice.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function OrderScreen(props) {
  const dispatch = useDispatch();
  const { id: orderId } = useParams();
  const [searchParams] = useSearchParams();

  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const handledRedirect = useRef(false);

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
  const orderSend = useSelector((state) => state.orderSend);
  const {
    loading: loadingSend,
    success: successSend,
    error: errorSend,
  } = orderSend;
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

  const token = searchParams.get("token");

  useEffect(() => {
    if (
      !order ||
      successPay ||
      successSend ||
      successDeliver ||
      successCancel ||
      (order && order._id !== orderId)
    ) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch({ type: ORDER_SEND_RESET });
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch({ type: ORDER_CANCEL_RESET });
      dispatch(detailsOrder(orderId, token));
      setClientSecret("");
    }
  }, [
    dispatch,
    orderId,
    order,
    token,
    successPay,
    successSend,
    successDeliver,
    successCancel,
  ]);

  useEffect(() => {
    if (!order || order.isPaid || order.status === "CANCELED") return;

    let cancelled = false;
    const setupStripe = async () => {
      const { data: publishableKey } = await Axios.get("/api/config/stripe");
      if (cancelled) return;
      setStripePromise(loadStripe(publishableKey));
      const { data } = await Axios.post(
        `/api/orders/${order._id}/create-payment-intent`,
        { confirmToken: token }
      );
      if (cancelled) return;
      setClientSecret(data.clientSecret);
    };
    setupStripe();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?._id]);

  useEffect(() => {
    if (handledRedirect.current) return;
    const paymentIntentId = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");
    if (
      paymentIntentId &&
      redirectStatus === "succeeded" &&
      order &&
      !order.isPaid
    ) {
      handledRedirect.current = true;
      dispatch(payOrder(order, { paymentIntentId, confirmToken: token }));
    }
  }, [searchParams, order, dispatch]);

  const sendHandler = () => {
    Swal.fire({
      title: "Send Order?",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(sendOrder(order._id));
        Swal.fire("Sent!", "", "success");
      }
    });
  };

  const deliverHandler = () => {
    Swal.fire({
      title: "Deliver Order?",
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
        dispatch(cancelOrder(order._id, token));
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
        <div className="row center order-container">
          <div className="order-inner">
            <h1 className="custom-font">Order {order._id}</h1>
            {loadingSend && <LoadingBox />}
            {errorSend && <MessageBox variant="error">{errorSend}</MessageBox>}
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
            {order.status === "SENT" && (
              <div style={{ marginBottom: "0.5rem" }}>
                <MessageBox variant="success">Order sent!</MessageBox>
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
                Subtotal ({order.itemsQty}{" "}
                {order.itemsQty > 1 ? "items" : "item"}) :{" "}
                {order.itemsPrice && order.itemsPrice.toFixed(2)}€
              </p>
              {(() => {
                const tax = getTax(order.shippingAddress.country, order.itemsPrice);
                return tax ? (
                  <p>
                    {tax.label} ({tax.display}) : {tax.amount.toFixed(2)}€
                  </p>
                ) : null;
              })()}
              <p>
                Shipping :{" "}
                {order.shippingPrice && order.shippingPrice.toFixed(2)}€
              </p>
              <h3 className="total">
                Total : {order.totalPrice && order.totalPrice.toFixed(2)}€
              </h3>
            </div>
            {order.status !== "CANCELED" && !order.isPaid && (
              <div className="stripe-payment">
                {!clientSecret || !stripePromise ? (
                  <LoadingBox />
                ) : (
                  <>
                    {errorPay && (
                      <MessageBox variant="error">{errorPay}</MessageBox>
                    )}
                    {loadingPay && <LoadingBox />}
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripeCheckoutForm order={order} dispatch={dispatch} token={token} />
                    </Elements>
                  </>
                )}
              </div>
            )}
            {userInfo &&
            userInfo.isAdmin &&
            order.isPaid &&
            order.status !== "CANCELED" &&
            !order.isSent &&
            !order.isDelivered ? (
              <div className="deliver-button full-width">
                <button className="primary" onClick={sendHandler}>
                  Send Order
                </button>
              </div>
            ) : (
              order.isSent &&
              !order.isDelivered && (
                <div className="deliver-button full-width">
                  <button className="primary" onClick={deliverHandler}>
                    Deliver Order
                  </button>
                </div>
              )
            )}
            {order.status !== "CANCELED" && !order.isDelivered && (
              <div className={`cancel-button ${order.isPaid && "full-width"}`}>
                <button className="dangerous" onClick={cancelHandler}>
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}
