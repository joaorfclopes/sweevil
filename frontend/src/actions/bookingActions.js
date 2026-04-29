import Axios from "axios";
import {
  AVAILABILITY_CREATE_FAIL,
  AVAILABILITY_CREATE_REQUEST,
  AVAILABILITY_CREATE_SUCCESS,
  AVAILABILITY_DELETE_FAIL,
  AVAILABILITY_DELETE_REQUEST,
  AVAILABILITY_DELETE_SUCCESS,
  AVAILABILITY_LIST_FAIL,
  AVAILABILITY_LIST_REQUEST,
  AVAILABILITY_LIST_SUCCESS,
  AVAILABILITY_UPDATE_FAIL,
  AVAILABILITY_UPDATE_REQUEST,
  AVAILABILITY_UPDATE_SUCCESS,
  BOOKING_CANCEL_FAIL,
  BOOKING_CANCEL_REQUEST,
  BOOKING_CANCEL_SUCCESS,
  BOOKING_DELETE_FAIL,
  BOOKING_DELETE_REQUEST,
  BOOKING_DELETE_SUCCESS,
  BOOKING_LIST_FAIL,
  BOOKING_LIST_REQUEST,
  BOOKING_LIST_SUCCESS,
} from "../constants/bookingConstants";

export const listBookings = () => async (dispatch, getState) => {
  dispatch({ type: BOOKING_LIST_REQUEST });
  const { userSignin: { userInfo } } = getState();
  try {
    const { data } = await Axios.get("/api/bookings", {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    });
    dispatch({ type: BOOKING_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: BOOKING_LIST_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const cancelBooking = (bookingId) => async (dispatch, getState) => {
  dispatch({ type: BOOKING_CANCEL_REQUEST });
  const { userSignin: { userInfo } } = getState();
  try {
    await Axios.put(`/api/bookings/${bookingId}/cancel`, {}, {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    });
    dispatch({ type: BOOKING_CANCEL_SUCCESS });
  } catch (error) {
    dispatch({
      type: BOOKING_CANCEL_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const deleteBooking = (bookingId) => async (dispatch, getState) => {
  dispatch({ type: BOOKING_DELETE_REQUEST });
  const { userSignin: { userInfo } } = getState();
  try {
    await Axios.delete(`/api/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    });
    dispatch({ type: BOOKING_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: BOOKING_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const listAvailability = () => async (dispatch) => {
  dispatch({ type: AVAILABILITY_LIST_REQUEST });
  try {
    const { data } = await Axios.get("/api/availability");
    dispatch({ type: AVAILABILITY_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: AVAILABILITY_LIST_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const createAvailability = (availData) => async (dispatch, getState) => {
  dispatch({ type: AVAILABILITY_CREATE_REQUEST });
  const { userSignin: { userInfo } } = getState();
  try {
    await Axios.post("/api/availability", availData, {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    });
    dispatch({ type: AVAILABILITY_CREATE_SUCCESS });
  } catch (error) {
    dispatch({
      type: AVAILABILITY_CREATE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const updateAvailability = (id, availData) => async (dispatch, getState) => {
  dispatch({ type: AVAILABILITY_UPDATE_REQUEST });
  const { userSignin: { userInfo } } = getState();
  try {
    await Axios.put(`/api/availability/${id}`, availData, {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    });
    dispatch({ type: AVAILABILITY_UPDATE_SUCCESS });
  } catch (error) {
    dispatch({
      type: AVAILABILITY_UPDATE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const deleteAvailability = (id) => async (dispatch, getState) => {
  dispatch({ type: AVAILABILITY_DELETE_REQUEST });
  const { userSignin: { userInfo } } = getState();
  try {
    await Axios.delete(`/api/availability/${id}`, {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    });
    dispatch({ type: AVAILABILITY_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: AVAILABILITY_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
