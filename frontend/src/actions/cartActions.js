import Axios from "axios";
import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_EMPTY,
  CART_SAVE_SHIPPING_ADDRESS,
} from "../constants/cartConstants";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

export const addToCart = (productId, qty, size) => async (
  dispatch,
  getState
) => {
  const { data } = await Axios.get(`/api/products/${productId}`);
  dispatch({
    type: CART_ADD_ITEM,
    payload: {
      name: data.name,
      image: data.images[0],
      finalPrice: data.finalPrice,
      countInStock: data.countInStock,
      product: data._id,
      isClothing: data.isClothing,
      qty,
      size,
    },
  });
  const notyf = new Notyf();
  notyf.success("Added to Cart");
  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
};

export const removeFromCart = (productId) => async (dispatch, getState) => {
  dispatch({
    type: CART_REMOVE_ITEM,
    payload: productId,
  });
  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
};

export const emptyCart = () => async (dispatch, getState) => {
  dispatch({
    type: CART_EMPTY,
  });
  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
};

export const saveShippingAddress = (data) => async (dispatch) => {
  dispatch({ type: CART_SAVE_SHIPPING_ADDRESS, payload: data });
  localStorage.setItem("shippingAddress", JSON.stringify(data));
};
