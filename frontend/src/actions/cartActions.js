import * as Sentry from '@sentry/react';
import Axios from 'axios';
import {
  CART_ADD_ITEM,
  CART_EMPTY,
  CART_REMOVE_ITEM,
  CART_SAVE_SHIPPING_ADDRESS,
} from '../constants/cartConstants';

export const addToCart = (productId, qty, size) => async (dispatch, getState) => {
  const { data } = await Axios.get(`/api/products/${productId}`);
  dispatch({
    type: CART_ADD_ITEM,
    payload: {
      name: data.name,
      image: data.images[0],
      price: data.price,
      countInStock: data.countInStock,
      product: data._id,
      isClothing: data.isClothing,
      qty,
      size,
    },
  });
  Sentry.metrics.count('cart.item_added', 1, { tags: { product_name: data.name } });
  console.log(`[cart] Added "${data.name}" x${qty}${size ? ` (${size})` : ''} — €${data.price}`);
  localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
};

export const removeFromCart = (productId, name) => async (dispatch, getState) => {
  dispatch({
    type: CART_REMOVE_ITEM,
    payload: productId,
  });
  Sentry.metrics.count('cart.item_removed', 1, { tags: { product_name: name } });
  console.log(`[cart] Removed "${name}"`);
  localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
};

export const emptyCart = () => async (dispatch, getState) => {
  dispatch({
    type: CART_EMPTY,
  });
  localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
};

export const saveShippingAddress = (data) => async (dispatch) => {
  dispatch({ type: CART_SAVE_SHIPPING_ADDRESS, payload: data });
  localStorage.setItem('shippingAddress', JSON.stringify(data));
};
