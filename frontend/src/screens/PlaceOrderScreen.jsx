import * as Sentry from '@sentry/react';
import $ from 'jquery';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../actions/orderActions';
import LoadingOverlay from '../components/LoadingOverlay';
import Placeholder from '../components/Placeholder';
import { getShippingLabel, getShippingPrice } from '../config/shippingZones';
import { getTax } from '../config/taxRates';
import { ORDER_CREATE_RESET } from '../constants/orderConstants';
import { useLazyLoad } from '../hooks/useLazyLoad';
import { toPrice } from '../utils';

function PlaceOrderItemImage({ item }) {
  const [containerRef, inView] = useLazyLoad('300px');
  const imgRef = useRef(null);

  useEffect(() => {
    if (inView && imgRef.current?.complete) {
      $(`#${item.product}-place-order-img`).addClass('show');
    }
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="item-image">
      <Placeholder height="100%" hide={inView}>
        <div id={`${item.product}-place-order-img`} className="item-image-inner">
          <Link to={`/shop/product/${item.product}`}>
            <img
              ref={imgRef}
              className="small"
              src={inView ? item.image : undefined}
              alt={item.name}
              onLoad={() => $(`#${item.product}-place-order-img`).addClass('show')}
            />
          </Link>
        </div>
      </Placeholder>
    </div>
  );
}

export default function PlaceOrderScreen(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { cartItems, shippingAddress } = cart;
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
    getShippingPrice(shippingAddress.country, shippingAddress.postalCode, cart.itemsPrice)
  );
  cart.totalPrice = toPrice(cart.itemsPrice + cart.shippingPrice);
  const shippingLabel = getShippingLabel(
    shippingAddress.country,
    shippingAddress.postalCode,
    cart.itemsPrice
  );
  const tax = getTax(shippingAddress.country, cart.itemsPrice);

  const placeOrderHandler = () => {
    Sentry.metrics.count('order.checkout_started', 1);
    dispatch(
      createOrder({
        orderItems: cartItems.map(({ product, qty, size }) => ({ product, qty, size })),
        shippingAddress,
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
            <h1 className="custom-font">Place Order</h1>
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
              <p>
                {shippingAddress.phoneNumber?.startsWith('+')
                  ? shippingAddress.phoneNumber
                  : `+${shippingAddress.phoneNumber}`}
              </p>
            </div>
            <div className="card">
              <h3>Items</h3>
              <ul className="cart-items">
                {cartItems.map((item, index) => (
                  <li key={item.product}>
                    <PlaceOrderItemImage item={item} />
                    <div className="item-content">
                      <div className="item-name">
                        <p>{item.name}</p>
                      </div>
                      <div className="item-price">
                        <p>{item.price && item.price.toFixed(2)}€</p>
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
                Subtotal ({cart.itemsQty} {cart.itemsQty > 1 ? 'items' : 'item'}) :{' '}
                {cart.itemsPrice && cart.itemsPrice.toFixed(2)}€
              </p>
              {tax && (
                <p>
                  {tax.label} ({tax.display}) : {tax.amount.toFixed(2)}€
                </p>
              )}
              <p>
                {shippingLabel} : {cart.shippingPrice && cart.shippingPrice.toFixed(2)}€
              </p>
              <h3 className="total">Total : {cart.totalPrice && cart.totalPrice.toFixed(2)}€</h3>
            </div>
            <button className="primary" onClick={placeOrderHandler}>
              Place Order
            </button>
          </div>
        </LoadingOverlay>
      </div>
    </section>
  );
}
