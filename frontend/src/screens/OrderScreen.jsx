import * as Sentry from '@sentry/react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import OrderItemsList from '../components/OrderItemsList';
import ShippingInfoTooltip from '../components/ShippingInfoTooltip';
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
import Swal from '../utils/swal';

function StripeCheckoutForm({ order, dispatch, token, onPayingChange }) {
  const { t } = useTranslation();
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
        {t('order.pay', { amount: order.totalPrice.toFixed(2) })}
      </button>
    </form>
  );
}

export default function OrderScreen(props) {
  const { t } = useTranslation();
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
      title: t('order.sendTitle'),
      showCancelButton: true,
      confirmButtonText: t('common.yes'),
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(sendOrder(order._id));
        Swal.fire(t('order.sendSuccess'), '', 'success');
      }
    });
  };

  const deliverHandler = () => {
    Swal.fire({
      title: t('order.deliverTitle'),
      showCancelButton: true,
      confirmButtonText: t('common.yes'),
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deliverOrder(order._id));
        Swal.fire(t('order.deliverSuccess'), '', 'success');
      }
    });
  };

  const cancelHandler = () => {
    if (userInfo?.isAdmin && order.isPaid) {
      Swal.fire({
        title: t('order.cancelTitle'),
        html: `<p>${t('order.cancelHtmlRefundWarning')}</p>`,
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: t('order.cancelAndRefund'),
        confirmButtonColor: '#1976d2',
        denyButtonText: t('order.cancelNoRefundBtn'),
        denyButtonColor: '#d32f2f',
        cancelButtonText: t('order.keepOrder'),
      }).then((result) => {
        if (result.isConfirmed) {
          dispatch(cancelOrder(order._id, token, 'yes'));
        } else if (result.isDenied) {
          dispatch(cancelOrder(order._id, token, 'no'));
        }
      });
    } else {
      Swal.fire({
        title: t('order.cancelSimpleTitle'),
        showConfirmButton: false,
        showDenyButton: true,
        showCancelButton: true,
        denyButtonText: t('common.yes'),
      }).then((result) => {
        if (result.isDenied) {
          dispatch(cancelOrder(order._id, token));
          Swal.fire(t('order.cancelledSwal'), '', 'error');
        }
      });
    }
  };

  const deleteHandler = () => {
    Swal.fire({
      title: t('order.deleteTitle'),
      text: t('order.deleteText'),
      showCancelButton: true,
      confirmButtonText: t('order.deleteBtn'),
      confirmButtonColor: '#d32f2f',
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteOrder(order._id));
    });
  };

  const refundHandler = () => {
    Swal.fire({
      title: `Reembolso €${order.totalPrice?.toFixed(2)} para ${order.shippingDetails?.fullName}?`,
      text: t('order.refundText'),
      showCancelButton: true,
      confirmButtonText: t('order.refundBtn'),
      confirmButtonColor: '#1976d2',
    }).then((result) => {
      if (result.isConfirmed) dispatch(refundOrder(order._id));
    });
  };

  const dismissRefundHandler = () => {
    Swal.fire({
      title: t('order.dismissRefundTitle'),
      text: t('order.dismissRefundText'),
      showCancelButton: true,
      confirmButtonText: t('order.dismissRefundBtn'),
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
                <h1 className="custom-font">{t('order.title')}</h1>
                {errorSend && <MessageBox variant="error">{errorSend}</MessageBox>}
                {errorDeliver && <MessageBox variant="error">{errorDeliver}</MessageBox>}
                {errorCancel && <MessageBox variant="error">{errorCancel}</MessageBox>}
                {errorDelete && <MessageBox variant="error">{errorDelete}</MessageBox>}
                {errorRefund && <MessageBox variant="error">{errorRefund}</MessageBox>}
                {errorDismiss && <MessageBox variant="error">{errorDismiss}</MessageBox>}
                {order.status === 'PAID' && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <MessageBox variant="success">{t('order.paidSuccess')}</MessageBox>
                  </div>
                )}
                {order.status?.startsWith('CANCELED') && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <MessageBox variant="error">{t('order.cancelled')}</MessageBox>
                  </div>
                )}
                {order.status === 'SENT' && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <MessageBox variant="success">{t('order.sent')}</MessageBox>
                  </div>
                )}
                {order.status === 'DELIVERED' && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <MessageBox variant="success">{t('order.delivered')}</MessageBox>
                  </div>
                )}
                <div className="card">
                  <h3>{t('order.shippingDetails')}</h3>
                  <p>
                    {t('shipping.fullName')}: {order.shippingDetails.fullName}
                  </p>
                  <p>
                    {t('shipping.address')}: {order.shippingDetails.address}
                  </p>
                  <p>
                    {t('shipping.city')}: {order.shippingDetails.city}
                  </p>
                  <p>
                    {t('shipping.postalCode')}: {order.shippingDetails.postalCode}
                  </p>
                  <p>
                    {t('shipping.country')}: {order.shippingDetails.country}
                  </p>
                </div>
                <div className="card">
                  <h3>{t('order.billingAddress')}</h3>
                  {(() => {
                    const billing = order.billingDetails || order.shippingDetails;
                    return (
                      <>
                        <p>
                          {t('shipping.fullName')}: {billing.fullName}
                        </p>
                        <p>
                          {t('shipping.address')}: {billing.address}
                        </p>
                        <p>
                          {t('shipping.city')}: {billing.city}
                        </p>
                        <p>
                          {t('shipping.postalCode')}: {billing.postalCode}
                        </p>
                        <p>
                          {t('shipping.country')}: {billing.country}
                        </p>
                      </>
                    );
                  })()}
                  {order.vatNif && (
                    <p>
                      {t('order.vatNif')}: {order.vatNif}
                    </p>
                  )}
                </div>
                <div className="card">
                  <h3>{t('order.contactInfo')}</h3>
                  <p>
                    {t('shipping.email')}: {order.shippingDetails.email}
                  </p>
                  <p>
                    {t('shipping.phone')}:{' '}
                    {order.shippingDetails.phoneNumber?.startsWith('+')
                      ? order.shippingDetails.phoneNumber
                      : `+${order.shippingDetails.phoneNumber}`}
                  </p>
                </div>
                {order.isPaid && (
                  <div className="card">
                    <h3>{t('order.paymentMethod')}</h3>
                    <p>
                      {t('order.paymentMethodLabel')}:{' '}
                      {order.paymentResult?.paymentMethod === 'mb_way'
                        ? `MB WAY${order.paymentResult?.paymentMethodLast ? ` ···${order.paymentResult.paymentMethodLast}` : ''}`
                        : `${t('order.paymentMethodCard')}${order.paymentResult?.paymentMethodLast ? ` ····${order.paymentResult.paymentMethodLast}` : ''}`}
                    </p>
                  </div>
                )}
                <div className="card">
                  <h3>{t('order.items')}</h3>
                  <OrderItemsList items={order.orderItems} namespace="order" idPrefix="order" />
                </div>
                <div className="card total-amount">
                  <p>
                    {t('order.subtotal', { count: order.itemsQty })} :{' '}
                    {order.itemsPrice && order.itemsPrice.toFixed(2)}€
                  </p>
                  {(() => {
                    const tax = getTax(order.shippingDetails.country, order.itemsPrice);
                    return tax ? (
                      <p>
                        {tax.label} ({tax.display}) : {tax.amount.toFixed(2)}€
                      </p>
                    ) : null;
                  })()}
                  <p>
                    {t('order.shipping')} {t('order.shippingTime')}
                    <ShippingInfoTooltip namespace="order" /> :{' '}
                    {order.shippingPrice && order.shippingPrice.toFixed(2)}€
                  </p>
                  <h3 className="total">
                    {t('order.total')} : {order.totalPrice && order.totalPrice.toFixed(2)}€
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
                        {t('order.sendBtn')}
                      </button>
                    )}
                  {order.isSent && !order.isDelivered && (
                    <button className="primary" onClick={deliverHandler}>
                      {t('order.deliverBtn')}
                    </button>
                  )}
                  {!order.status?.startsWith('CANCELED') &&
                    !order.isDelivered &&
                    (order.isPaid || userInfo?.isAdmin) && (
                      <button className="dangerous-outline" onClick={cancelHandler}>
                        {t('order.cancelBtn')}
                      </button>
                    )}
                  {userInfo?.isAdmin && order.status === 'CANCELED_PENDING_REFUND' && (
                    <button className="primary" onClick={refundHandler}>
                      {t('order.issueRefundBtn')}
                    </button>
                  )}
                  {userInfo?.isAdmin && order.status === 'CANCELED_PENDING_REFUND' && (
                    <button className="dangerous-outline" onClick={dismissRefundHandler}>
                      {t('order.cancelRefundBtn')}
                    </button>
                  )}
                  {userInfo?.isAdmin && (
                    <button className="dangerous" onClick={deleteHandler}>
                      {t('order.deleteOrderBtn')}
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
