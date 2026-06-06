import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../actions/orderActions';
import LoadingOverlay from '../components/LoadingOverlay';
import OrderItemsList from '../components/OrderItemsList';
import ShippingInfoTooltip from '../components/ShippingInfoTooltip';
import { getShippingPrice } from '../config/shippingZones';
import { getTax } from '../config/taxRates';
import { ORDER_CREATE_RESET } from '../constants/orderConstants';
import { toPrice } from '../utils';

export default function PlaceOrderScreen(props) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { cartItems, shippingDetails, billingDetails, vatNif } = cart;
  const orderCreate = useSelector((state) => state.orderCreate);
  const { loading, success, order } = orderCreate;

  useEffect(() => {
    if (cartItems.length <= 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  cart.itemsQty = cartItems.reduce((a, c) => a + c.qty, 0);
  cart.itemsPrice = toPrice(cartItems.reduce((a, c) => a + c.price * c.qty, 0));
  cart.shippingPrice = toPrice(
    getShippingPrice(shippingDetails.country, shippingDetails.postalCode, cart.itemsPrice)
  );
  cart.totalPrice = toPrice(cart.itemsPrice + cart.shippingPrice);
  const tax = getTax(shippingDetails.country, cart.itemsPrice);

  const placeOrderHandler = () => {
    Sentry.metrics.count('order.checkout_started', 1);
    dispatch(
      createOrder({
        orderItems: cartItems.map(({ product, qty, size }) => ({ product, qty, size })),
        shippingDetails,
        billingDetails,
        vatNif: vatNif || undefined,
        lang: i18n.language,
      })
    );
  };

  useEffect(() => {
    if (success) {
      navigate(`/cart/order/${order.confirmToken}`);
      dispatch({ type: ORDER_CREATE_RESET });
    }
  }, [success, navigate, order, dispatch]);

  return (
    <section className="place-order cards-section">
      <div className="row center place-order-container">
        <LoadingOverlay loading={loading}>
          <div className="place-order-inner">
            <h1 className="custom-font">{t('placeOrder.title')}</h1>
            <div className="card">
              <h3>{t('placeOrder.shippingDetails')}</h3>
              <p>
                {t('shipping.fullName')}: {shippingDetails.fullName}
              </p>
              <p>
                {t('shipping.address')}: {shippingDetails.address}
              </p>
              <p>
                {t('shipping.city')}: {shippingDetails.city}
              </p>
              <p>
                {t('shipping.postalCode')}: {shippingDetails.postalCode}
              </p>
              <p>
                {t('shipping.country')}: {shippingDetails.country}
              </p>
            </div>
            <div className="card">
              <h3>{t('placeOrder.billingAddress')}</h3>
              <p>
                {t('shipping.fullName')}: {billingDetails.fullName}
              </p>
              <p>
                {t('shipping.address')}: {billingDetails.address}
              </p>
              <p>
                {t('shipping.city')}: {billingDetails.city}
              </p>
              <p>
                {t('shipping.postalCode')}: {billingDetails.postalCode}
              </p>
              <p>
                {t('shipping.country')}: {billingDetails.country}
              </p>
              {vatNif && (
                <p>
                  {t('placeOrder.vatNif')}: {vatNif}
                </p>
              )}
            </div>
            <div className="card">
              <h3>{t('placeOrder.contactInfo')}</h3>
              <p>
                {t('shipping.email')}: {shippingDetails.email}
              </p>
              <p>
                {t('shipping.phone')}:{' '}
                {shippingDetails.phoneNumber?.startsWith('+')
                  ? shippingDetails.phoneNumber
                  : `+${shippingDetails.phoneNumber}`}
              </p>
            </div>
            <div className="card">
              <h3>{t('placeOrder.items')}</h3>
              <OrderItemsList items={cartItems} namespace="placeOrder" idPrefix="place-order" />
            </div>
            <div className="card total-amount">
              <p>
                {t('placeOrder.subtotal', { count: cart.itemsQty })} :{' '}
                {cart.itemsPrice && cart.itemsPrice.toFixed(2)}€
              </p>
              {tax && (
                <p>
                  {tax.label} ({tax.display}) : {tax.amount.toFixed(2)}€
                </p>
              )}
              <p>
                {t('placeOrder.shipping')} {t('placeOrder.shippingTime')}
                <ShippingInfoTooltip namespace="placeOrder" /> :{' '}
                {cart.shippingPrice && cart.shippingPrice.toFixed(2)}€
              </p>
              <h3 className="total">
                {t('placeOrder.total')} : {cart.totalPrice && cart.totalPrice.toFixed(2)}€
              </h3>
            </div>
            <button className="primary" style={{ width: '100%' }} onClick={placeOrderHandler}>
              {t('placeOrder.confirmBtn')}
            </button>
          </div>
        </LoadingOverlay>
      </div>
    </section>
  );
}
