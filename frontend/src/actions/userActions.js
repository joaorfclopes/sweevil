import Axios from "axios";
import {
  USER_REGISTER_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_SIGNIN_FAIL,
  USER_SIGNIN_REQUEST,
  USER_SIGNIN_SUCCESS,
  USER_SIGNOUT,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAIL,
  USER_UPDATE_REQUEST,
  USER_UPDATE_FAIL,
  USER_UPDATE_SUCCESS,
  USER_FORGOT_PASS_REQUEST,
  USER_FORGOT_PASS_SUCCESS,
  USER_FORGOT_PASS_FAIL,
  USER_RESET_PASS_REQUEST,
  USER_RESET_PASS_FAIL,
  USER_RESET_PASS_SUCCESS,
} from "../constants/userConstants";

export const signin = (email, password) => async (dispatch) => {
  dispatch({ type: USER_SIGNIN_REQUEST, payload: { email, password } });
  try {
    const { data } = await Axios.post("/api/users/signin", { email, password });
    dispatch({ type: USER_SIGNIN_SUCCESS, payload: data });
    localStorage.setItem("userInfo", JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: USER_SIGNIN_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const register = (name, email, phoneNumber, password) => async (
  dispatch
) => {
  dispatch({
    type: USER_REGISTER_REQUEST,
    payload: { name, email, phoneNumber, password },
  });
  try {
    const { data } = await Axios.post("/api/users/register", {
      name,
      email,
      phoneNumber,
      password,
    });
    dispatch({ type: USER_REGISTER_SUCCESS, payload: data });
    dispatch({ type: USER_SIGNIN_SUCCESS, payload: data });
    localStorage.setItem("userInfo", JSON.stringify(data));
    // eslint-disable-next-line no-unused-vars
    const { sendEmail } = await Axios.post("/api/email/userCreated", {
      userInfo: data,
    });
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const signout = () => async (dispatch) => {
  localStorage.removeItem("userInfo");
  localStorage.removeItem("cartItems");
  localStorage.removeItem("shippingAddress");
  dispatch({ type: USER_SIGNOUT });
};

export const detailsUser = (userId) => async (dispatch, getState) => {
  dispatch({ type: USER_DETAILS_REQUEST, payload: userId });
  const {
    userSignin: { userInfo },
  } = getState();
  try {
    const { data } = await Axios.get(`/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    });
    dispatch({ type: USER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: USER_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const updateUser = (user) => async (dispatch, getState) => {
  dispatch({ type: USER_UPDATE_REQUEST, payload: user });
  const {
    userSignin: { userInfo },
  } = getState();
  try {
    const { data } = await Axios.put("/api/users/profile", user, {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    });
    dispatch({ type: USER_UPDATE_SUCCESS, payload: data });
    dispatch({ type: USER_SIGNIN_SUCCESS, payload: data });
    localStorage.setItem("userInfo", JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: USER_UPDATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const sendResetPasswordMail = (mail) => async (dispatch) => {
  dispatch({ type: USER_FORGOT_PASS_REQUEST, payload: mail });
  try {
    const { sendEmail } = await Axios.post("/api/email/forgotPassword", {
      email: mail,
    });
    dispatch({ type: USER_FORGOT_PASS_SUCCESS, payload: sendEmail });
  } catch (error) {
    dispatch({
      type: USER_FORGOT_PASS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const resetPassword = (user, userId) => async (dispatch) => {
  dispatch({ type: USER_RESET_PASS_REQUEST, payload: user });
  try {
    const { data } = await Axios.put(
      `/api/users/resetPassword/${userId}`,
      user
    );
    dispatch({ type: USER_RESET_PASS_SUCCESS, payload: data });

    setTimeout(() => {
      window.close();
      window.open(`${process.env.REACT_APP_HOME_PAGE}/signin`);
    }, 1200);
  } catch (error) {
    dispatch({
      type: USER_RESET_PASS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
