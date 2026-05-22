import * as Sentry from '@sentry/react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Axios from 'axios';
import $ from 'jquery';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  cancelOrder,
  deleteOrder,
  deliverOrder,
  detailsOrder,
  dismissRefund,
  payOrder,
  refundOrder,
  sendOrder,
} from '../actions/orderActions';
import LoadingOverlay from '../components/LoadingOverlay';
import MessageBox from '../components/MessageBox';
import PlaceHolder from '../components/Placeholder';
import { getTax } from '../config/taxRates';
import {
  ORDER_CANCEL_RESET,
  ORDER_DELETE_RESET,
  ORDER_DELIVER_RESET,
  ORDER_DETAILS_RESET,
  ORDER_DISMISS_REFUND_RESET,
  ORDER_PAY_RESET,
  ORDER_REFUND_RESET,
  ORDER_SEND_RESET,
} from '../constants/orderConstants';
import { useLazyLoad } from '../hooks/useLazyLoad';
import Swal from '../utils/swal';

function OrderItemImage({ item }) {
  const [containerRef, inView] = useLazyLoad('300px');
  const imgRef = useRef(null);

  useEffect(() => {
    if (inView && imgRef.current?.complete) {
      $(`#${item.product}-order-img`).addClass('show');
    }
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="item-image">
      <PlaceHolder height="100%" hide={inView}>
        <div id={`${item.product}-order-img`} className="item-image-inner">
          <Link to={`/shop/product/${item.product}`}>
            <img
              ref={imgRef}
              className="small"
              src={inView ? item.image : undefined}
              alt={item.name}
              onLoad={() => $(`#${item.product}-order-img`).addClass('show')}
            />
          </Link>
        </div>
      </PlaceHolder>
    </div>
  );
}

function StripeCheckoutForm({ order, dispatch, token, onPayingChange }) {
  const stripe = useStripe();
  const elements = useElements();
  const [stripeError, setStripeError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    onPayingChange?.(true);
    setStripeError('');
    Sentry.metrics.count('order.payment_initiated', 1);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });
    if (error) {
      setStripeError(error.message);
      onPayingChange?.(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPayingChange?.(false);
      dispatch(payOrder(order, { paymentIntentId: paymentIntent.id, confirmToken: token }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ wallets: { link: 'never' } }} />
      {stripeError && <MessageBox variant="error">{stripeError}</MessageBox>}
      <button
        type="submit"
        disabled={!stripe}
        className="primary"
        style={{ marginTop: '1rem', width: '100%' }}
      >
        {`Pay €${order.totalPrice.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function OrderScreen(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const [searchParams] = useSearchParams();

  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [stripeFormPaying, setStripeFormPaying] = useState(false);
  const handledRedirect = useRef(false);
  const fetchedTokenRef = useRef(null);

  const orderDetails = useSelector((state) => state.orderDetails);
  const { loading, order, error, errorStatus } = orderDetails;
  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay, error: errorPay } = orderPay;
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const orderSend = useSelector((state) => state.orderSend);
  const { loading: loadingSend, success: successSend, error: errorSend } = orderSend;
  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver, error: errorDeliver } = orderDeliver;
  const orderCancel = useSelector((state) => state.orderCancel);
  const { loading: loadingCancel, success: successCancel, error: errorCancel } = orderCancel;
  const orderDelete = useSelector((state) => state.orderDelete);
  const { loading: loadingDelete, success: successDelete, error: errorDelete } = orderDelete;
  const orderRefund = useSelector((state) => state.orderRefund);
  const { loading: loadingRefund, success: successRefund, error: errorRefund } = orderRefund;
  const orderDismissRefund = useSelector((state) => state.orderDismissRefund);
  const {
    loading: loadingDismiss,
    success: successDismiss,
    error: errorDismiss,
  } = orderDismissRefund;

  useEffect(() => {
    return () => {
      dispatch({ type: ORDER_DETAILS_RESET });
    };
  }, [dispatch]);

  useEffect(() => {
    if (errorStatus === 404 || errorStatus === 403) {
      navigate('/not-found');
    }
  }, [errorStatus, navigate]);

  useEffect(() => {
    if (successDelete) {
      dispatch({ type: ORDER_DELETE_RESET });
      navigate('/admin');
      return;
    }
    const shouldFetch =
      fetchedTokenRef.current !== token ||
      successPay ||
      successSend ||
      successDeliver ||
      successCancel ||
      successRefund ||
      successDismiss;
    if (shouldFetch) {
      fetchedTokenRef.current = token;
      dispatch({ type: ORDER_PAY_RESET });
      dispatch({ type: ORDER_SEND_RESET });
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch({ type: ORDER_CANCEL_RESET });
      dispatch({ type: ORDER_REFUND_RESET });
      dispatch({ type: ORDER_DISMISS_REFUND_RESET });
      dispatch(detailsOrder(token));
      setClientSecret('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    token,
    successPay,
    successSend,
    successDeliver,
    successCancel,
    successDelete,
    successRefund,
    successDismiss,
  ]);

  useEffect(() => {
    if (!order || order.isPaid || order.status?.startsWith('CANCELED')) return;

    let cancelled = false;
    const setupStripe = async () => {
      const { data: publishableKey } = await Axios.get('/api/config/stripe');
      if (cancelled) return;
      setStripePromise(loadStripe(publishableKey));
      const { data } = await Axios.post(`/api/orders/${order._id}/create-payment-intent`, {
        confirmToken: token,
      });
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
    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    if (paymentIntentId && redirectStatus === 'succeeded' && order && !order.isPaid) {
      handledRedirect.current = true;
      dispatch(payOrder(order, { paymentIntentId, confirmToken: token }));
    }
  }, [searchParams, order, dispatch]);

  const sendHandler = () => {
    Swal.fire({
      title: 'Send Order?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(sendOrder(order._id));
        Swal.fire('Sent!', '', 'success');
      }
    });
  };

  const deliverHandler = () => {
    Swal.fire({
      title: 'Deliver Order?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deliverOrder(order._id));
        Swal.fire('Delivered!', '', 'success');
      }
    });
  };

  const cancelHandler = () => {
    if (userInfo?.isAdmin && order.isPaid) {
      Swal.fire({
        title: 'Cancel this order?',
        html: `
          <p>Do you want to issue a refund to the client?</p>
          <p style="color:#d32f2f;font-size:0.85rem;margin-top:0.75rem;">
            ⚠️ If you choose not to refund now, it will not be possible to refund via this website.
            You will need to do it directly through your Stripe account.
          </p>
        `,
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Cancel & Refund',
        confirmButtonColor: '#1976d2',
        denyButtonText: 'Cancel (No Refund)',
        denyButtonColor: '#d32f2f',
        cancelButtonText: 'Keep Order',
      }).then((result) => {
        if (result.isConfirmed) {
          dispatch(cancelOrder(order._id, token, 'yes'));
        } else if (result.isDenied) {
          dispatch(cancelOrder(order._id, token, 'no'));
        }
      });
    } else {
      Swal.fire({
        title: 'Cancel Order?',
        showConfirmButton: false,
        showDenyButton: true,
        showCancelButton: true,
        denyButtonText: 'Yes',
      }).then((result) => {
        if (result.isDenied) {
          dispatch(cancelOrder(order._id, token));
          Swal.fire('Canceled!', '', 'error');
        }
      });
    }
  };

  const deleteHandler = () => {
    Swal.fire({
      title: 'Delete this order?',
      text: 'This cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d32f2f',
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteOrder(order._id));
    });
  };

  const refundHandler = () => {
    Swal.fire({
      title: `Refund €${order.totalPrice?.toFixed(2)} to ${order.shippingAddress?.fullName}?`,
      text: 'This will issue a full refund via Stripe. This cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Refund',
      confirmButtonColor: '#1976d2',
    }).then((result) => {
      if (result.isConfirmed) dispatch(refundOrder(order._id));
    });
  };

  const dismissRefundHandler = () => {
    Swal.fire({
      title: 'Cancel pending refund?',
      text: 'Status will change to "Cancelled (No Refund)". The refund button will no longer appear.',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel refund',
      confirmButtonColor: '#d32f2f',
    }).then((result) => {
      if (result.isConfirmed) dispatch(dismissRefund(order._id));
    });
  };

  return (
    <section className="order cards-section">
      {error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <LoadingOverlay
          loading={
            loading ||
            loadingSend ||
            loadingDeliver ||
            loadingCancel ||
            loadingPay ||
            stripeFormPaying ||
            loadingRefund ||
            loadingDismiss ||
            loadingDelete ||
            (order &&
              !order.isPaid &&
              !order.status?.startsWith('CANCELED') &&
              (!clientSecret || !stripePromise))
          }
          minHeight="75vh"
        >
          {order && (
            <div className="row center order-container">
              <div className="order-inner">
                <h1 className="custom-font">Your order details</h1>
                {errorSend && <MessageBox variant="error">{errorSend}</MessageBox>}
                {errorDeliver && <MessageBox variant="error">{errorDeliver}</MessageBox>}
                {errorCancel && <MessageBox variant="error">{errorCancel}</MessageBox>}
                {errorDelete && <MessageBox variant="error">{errorDelete}</MessageBox>}
                {errorRefund && <MessageBox variant="error">{errorRefund}</MessageBox>}
                {errorDismiss && <MessageBox variant="error">{errorDismiss}</MessageBox>}
                {order.status === 'PAID' && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <MessageBox variant="success">
                      Order successfully paid! Check your email Inbox (if you can't find it check
                      your Spam) for more information.
                    </MessageBox>
                  </div>
                )}
                {order.status?.startsWith('CANCELED') && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <MessageBox variant="error">Order canceled.</MessageBox>
                  </div>
                )}
                {order.status === 'SENT' && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <MessageBox variant="success">Order sent!</MessageBox>
                  </div>
                )}
                {order.status === 'DELIVERED' && (
                  <div style={{ marginBottom: '0.5rem' }}>
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
                  <p>
                    {order.shippingAddress.phoneNumber?.startsWith('+')
                      ? order.shippingAddress.phoneNumber
                      : `+${order.shippingAddress.phoneNumber}`}
                  </p>
                </div>
                <div className="card">
                  <h3>Items</h3>
                  <ul className="cart-items">
                    {order.orderItems.map((item, index) => (
                      <li key={item.product}>
                        <OrderItemImage item={item} />
                        <div className="item-content">
                          <div className="item-name">
                            <p>{item.name}</p>
                          </div>
                          <div className="item-price">
                            <p>{item.price && item.price.toFixed(2)}€</p>
                          </div>
                        </div>
                        <div className="item-content">
                          {item.size && <div className="item-size">Size: {item.size}</div>}
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
                    Subtotal ({order.itemsQty} {order.itemsQty > 1 ? 'items' : 'item'}) :{' '}
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
                  <p>Shipping : {order.shippingPrice && order.shippingPrice.toFixed(2)}€</p>
                  <h3 className="total">
                    Total : {order.totalPrice && order.totalPrice.toFixed(2)}€
                  </h3>
                </div>
                {!order.status?.startsWith('CANCELED') &&
                  !order.isPaid &&
                  clientSecret &&
                  stripePromise && (
                    <div className="stripe-payment">
                      {errorPay && <MessageBox variant="error">{errorPay}</MessageBox>}
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <StripeCheckoutForm
                          order={order}
                          dispatch={dispatch}
                          token={token}
                          onPayingChange={setStripeFormPaying}
                        />
                      </Elements>
                    </div>
                  )}
                <div
                  style={{
                    clear: 'both',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                  }}
                >
                  {userInfo?.isAdmin &&
                    order.isPaid &&
                    !order.status?.startsWith('CANCELED') &&
                    !order.isSent &&
                    !order.isDelivered && (
                      <button className="primary" onClick={sendHandler}>
                        Send Order
                      </button>
                    )}
                  {order.isSent && !order.isDelivered && (
                    <button className="primary" onClick={deliverHandler}>
                      Deliver Order
                    </button>
                  )}
                  {!order.status?.startsWith('CANCELED') &&
                    !order.isDelivered &&
                    (order.isPaid || userInfo?.isAdmin) && (
                      <button className="dangerous-outline" onClick={cancelHandler}>
                        Cancel Order
                      </button>
                    )}
                  {userInfo?.isAdmin && order.status === 'CANCELED_PENDING_REFUND' && (
                    <button className="primary" onClick={refundHandler}>
                      Issue Refund
                    </button>
                  )}
                  {userInfo?.isAdmin && order.status === 'CANCELED_PENDING_REFUND' && (
                    <button className="dangerous-outline" onClick={dismissRefundHandler}>
                      Cancel Refund
                    </button>
                  )}
                  {userInfo?.isAdmin && (
                    <button className="dangerous" onClick={deleteHandler}>
                      Delete Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </LoadingOverlay>
      )}
    </section>
  );
}
