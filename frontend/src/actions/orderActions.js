import Axios from "axios";
import { CART_EMPTY } from "../constants/cartConstants";
import {
  ORDER_CREATE_FAIL,
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_SUCCESS,
  ORDER_DETAILS_FAIL,
  ORDER_PAY_REQUEST,
  ORDER_PAY_SUCCESS,
  ORDER_PAY_FAIL,
  ORDER_LIST_REQUEST,
  ORDER_LIST_FAIL,
  ORDER_LIST_SUCCESS,
  ORDER_ADMIN_LIST_REQUEST,
  ORDER_ADMIN_LIST_SUCCESS,
  ORDER_ADMIN_LIST_FAIL,
  ORDER_DELETE_REQUEST,
  ORDER_DELETE_FAIL,
  ORDER_DELETE_SUCCESS,
  ORDER_DELIVER_REQUEST,
  ORDER_DELIVER_SUCCESS,
  ORDER_DELIVER_FAIL,
  ORDER_CANCEL_REQUEST,
  ORDER_CANCEL_SUCCESS,
  ORDER_CANCEL_FAIL,
} from "../constants/orderConstants";

export const createOrder = (order) => async (dispatch) => {
  dispatch({ type: ORDER_CREATE_REQUEST, payload: order });
  try {
    const { data } = await Axios.post("/api/orders", order);
    dispatch({ type: ORDER_CREATE_SUCCESS, payload: data.order });
    dispatch({ type: CART_EMPTY });
    localStorage.removeItem("cartItems");
  } catch (error) {
    dispatch({
      type: ORDER_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const detailsOrder = (orderId) => async (dispatch) => {
  dispatch({ type: ORDER_DETAILS_REQUEST, payload: orderId });
  try {
    const { data } = await Axios.get(`/api/orders/${orderId}`);
    dispatch({ type: ORDER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const payOrder = (order, paymentResult) => async (dispatch) => {
  dispatch({ type: ORDER_PAY_REQUEST, payload: { order, paymentResult } });
  try {
    const { data } = await Axios.put(
      `/api/orders/${order._id}/pay`,
      paymentResult
    );
    dispatch({ type: ORDER_PAY_SUCCESS, payload: data });
    // eslint-disable-next-line no-unused-vars
    const { sendEmail } = await Axios.post("/api/email/placedOrder", {
      order: order,
    });
    // eslint-disable-next-line no-unused-vars
    const { sendEmailAdmin } = await Axios.post("/api/email/placedOrderAdmin", {
      order: order,
    });
  } catch (error) {
    dispatch({
      type: ORDER_PAY_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const deliverOrder = (orderId) => async (dispatch, getState) => {
  dispatch({ type: ORDER_DELIVER_REQUEST, payload: orderId });
  const {
    userSignin: { userInfo },
  } = getState();
  try {
    const { data } = await Axios.put(
      `/api/orders/${orderId}/deliver`,
      {},
      {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
    );
    dispatch({ type: ORDER_DELIVER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_DELIVER_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const cancelOrder = (orderId) => async (dispatch) => {
  dispatch({ type: ORDER_CANCEL_REQUEST, payload: orderId });
  try {
    const { data } = await Axios.put(`/api/orders/${orderId}/cancel`, {});
    dispatch({ type: ORDER_CANCEL_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_CANCEL_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const listOrder = () => async (dispatch, getState) => {
  dispatch({ type: ORDER_LIST_REQUEST });
  const {
    userSignin: { userInfo },
  } = getState();
  try {
    const { data } = await Axios.get(`/api/orders/list`, {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    });
    dispatch({ type: ORDER_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const listOrders = () => async (dispatch, getState) => {
  dispatch({ type: ORDER_ADMIN_LIST_REQUEST });
  const {
    userSignin: { userInfo },
  } = getState();
  try {
    const { data } = await Axios.get(`/api/orders`, {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    });
    dispatch({ type: ORDER_ADMIN_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_ADMIN_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const deleteOrder = (orderId) => async (dispatch, getState) => {
  dispatch({ type: ORDER_DELETE_REQUEST, payload: orderId });
  const {
    userSignin: { userInfo },
  } = getState();
  try {
    const { data } = await Axios.delete(`/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    });
    dispatch({ type: ORDER_DELETE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_DELETE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
