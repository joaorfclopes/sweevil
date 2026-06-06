import Axios from 'axios';
import { CART_EMPTY } from '../constants/cartConstants';
import {
  ORDER_ADMIN_LIST_FAIL,
  ORDER_ADMIN_LIST_REQUEST,
  ORDER_ADMIN_LIST_SUCCESS,
  ORDER_CANCEL_FAIL,
  ORDER_CANCEL_REQUEST,
  ORDER_CANCEL_SUCCESS,
  ORDER_CREATE_FAIL,
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_DELETE_FAIL,
  ORDER_DELETE_REQUEST,
  ORDER_DELETE_SUCCESS,
  ORDER_DELIVER_FAIL,
  ORDER_DELIVER_REQUEST,
  ORDER_DELIVER_SUCCESS,
  ORDER_DETAILS_FAIL,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_SUCCESS,
  ORDER_DISMISS_REFUND_FAIL,
  ORDER_DISMISS_REFUND_REQUEST,
  ORDER_DISMISS_REFUND_SUCCESS,
  ORDER_LIST_FAIL,
  ORDER_LIST_REQUEST,
  ORDER_LIST_SUCCESS,
  ORDER_PAY_FAIL,
  ORDER_PAY_REQUEST,
  ORDER_PAY_SUCCESS,
  ORDER_REFUND_FAIL,
  ORDER_REFUND_REQUEST,
  ORDER_REFUND_SUCCESS,
  ORDER_SEND_FAIL,
  ORDER_SEND_REQUEST,
  ORDER_SEND_SUCCESS,
} from '../constants/orderConstants';
import { translateBackendMessage } from '../utils/translateError';

export const createOrder = (order) => async (dispatch) => {
  dispatch({ type: ORDER_CREATE_REQUEST, payload: order });
  try {
    const { data } = await Axios.post('/api/orders', order);
    dispatch({ type: ORDER_CREATE_SUCCESS, payload: data.order });
    dispatch({ type: CART_EMPTY });
    localStorage.removeItem('cartItems');
    console.log(`[order] Created — ${data.order._id}`);
  } catch (error) {
    const msg = translateBackendMessage(error.response?.data?.message) || error.message;
    console.warn(`[order] Create failed — ${msg}`);
    dispatch({ type: ORDER_CREATE_FAIL, payload: msg });
  }
};

export const detailsOrder = (token) => async (dispatch) => {
  dispatch({ type: ORDER_DETAILS_REQUEST });
  try {
    const { data } = await Axios.get(`/api/orders/token/${token}`);
    dispatch({ type: ORDER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_DETAILS_FAIL,
      payload: translateBackendMessage(error.response?.data?.message) || error.message,
      statusCode: error.response?.status,
    });
  }
};

export const payOrder = (token, paymentResult) => async (dispatch) => {
  dispatch({ type: ORDER_PAY_REQUEST });
  try {
    const { data } = await Axios.put(`/api/orders/token/${token}/pay`, paymentResult);
    dispatch({ type: ORDER_PAY_SUCCESS, payload: data });
    console.log(`[order] Paid — token ${token}`);
  } catch (error) {
    if (error.response?.data?.message === 'Order already paid') {
      const { data } = await Axios.get(`/api/orders/token/${token}`);
      dispatch({ type: ORDER_PAY_SUCCESS, payload: data });
      console.log(`[order] Paid (already confirmed) — token ${token}`);
    } else {
      const msg = translateBackendMessage(error.response?.data?.message) || error.message;
      console.warn(`[order] Pay failed — token ${token} — ${msg}`);
      dispatch({ type: ORDER_PAY_FAIL, payload: msg });
    }
  }
};

export const sendOrder = (orderId, carrier, trackingNumber) => async (dispatch) => {
  dispatch({ type: ORDER_SEND_REQUEST, payload: orderId });
  try {
    const { data } = await Axios.put(`/api/orders/${orderId}/send`, { carrier, trackingNumber });
    dispatch({ type: ORDER_SEND_SUCCESS, payload: data });
    await Axios.post('/api/email/sentOrder', { order: data.order });
  } catch (error) {
    dispatch({
      type: ORDER_SEND_FAIL,
      payload: translateBackendMessage(error.response?.data?.message) || error.message,
    });
  }
};

export const deliverOrder = (orderId) => async (dispatch) => {
  dispatch({ type: ORDER_DELIVER_REQUEST, payload: orderId });
  try {
    const { data } = await Axios.put(`/api/orders/${orderId}/deliver`, {});
    dispatch({ type: ORDER_DELIVER_SUCCESS, payload: data });
    await Axios.post('/api/email/deliveredOrder', { order: data.order });
  } catch (error) {
    dispatch({
      type: ORDER_DELIVER_FAIL,
      payload: translateBackendMessage(error.response?.data?.message) || error.message,
    });
  }
};

export const cancelOrder =
  (token, refundChoice = null) =>
  async (dispatch) => {
    dispatch({ type: ORDER_CANCEL_REQUEST });
    try {
      const body = {};
      if (refundChoice) body.refundChoice = refundChoice;
      const { data } = await Axios.put(`/api/orders/token/${token}/cancel`, body);
      dispatch({ type: ORDER_CANCEL_SUCCESS, payload: data });
      console.log(`[order] Cancelled — token ${token}`);
    } catch (error) {
      dispatch({
        type: ORDER_CANCEL_FAIL,
        payload: translateBackendMessage(error.response?.data?.message) || error.message,
      });
    }
  };

export const refundOrder = (orderId) => async (dispatch) => {
  dispatch({ type: ORDER_REFUND_REQUEST });
  try {
    const { data } = await Axios.post(`/api/orders/${orderId}/refund`);
    dispatch({ type: ORDER_REFUND_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_REFUND_FAIL,
      payload: translateBackendMessage(error.response?.data?.message) || error.message,
    });
  }
};

export const listOrder = () => async (dispatch) => {
  dispatch({ type: ORDER_LIST_REQUEST });
  try {
    const { data } = await Axios.get('/api/orders/list');
    dispatch({ type: ORDER_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_LIST_FAIL,
      payload: translateBackendMessage(error.response?.data?.message) || error.message,
    });
  }
};

export const listOrders =
  ({ page = 1, limit = 20, search = '', status = '' } = {}) =>
  async (dispatch) => {
    dispatch({ type: ORDER_ADMIN_LIST_REQUEST });
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const { data } = await Axios.get(`/api/orders?${params}`);
      dispatch({ type: ORDER_ADMIN_LIST_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: ORDER_ADMIN_LIST_FAIL,
        payload: translateBackendMessage(error.response?.data?.message) || error.message,
      });
    }
  };

export const dismissRefund = (orderId) => async (dispatch) => {
  dispatch({ type: ORDER_DISMISS_REFUND_REQUEST });
  try {
    const { data } = await Axios.put(`/api/orders/${orderId}/dismiss-refund`);
    dispatch({ type: ORDER_DISMISS_REFUND_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_DISMISS_REFUND_FAIL,
      payload: translateBackendMessage(error.response?.data?.message) || error.message,
    });
  }
};

export const deleteOrder = (orderId) => async (dispatch) => {
  dispatch({ type: ORDER_DELETE_REQUEST, payload: orderId });
  try {
    const { data } = await Axios.delete(`/api/orders/${orderId}`);
    dispatch({ type: ORDER_DELETE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_DELETE_FAIL,
      payload: translateBackendMessage(error.response?.data?.message) || error.message,
    });
  }
};
