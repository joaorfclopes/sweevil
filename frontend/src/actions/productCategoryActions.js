import Axios from "axios";
import {
  PRODUCT_CATEGORY_LIST_REQUEST,
  PRODUCT_CATEGORY_LIST_SUCCESS,
  PRODUCT_CATEGORY_LIST_FAIL,
  PRODUCT_CATEGORY_CREATE_REQUEST,
  PRODUCT_CATEGORY_CREATE_SUCCESS,
  PRODUCT_CATEGORY_CREATE_FAIL,
  PRODUCT_CATEGORY_DELETE_REQUEST,
  PRODUCT_CATEGORY_DELETE_SUCCESS,
  PRODUCT_CATEGORY_DELETE_FAIL,
} from "../constants/productCategoryConstants";

export const listProductCategories = () => async (dispatch) => {
  dispatch({ type: PRODUCT_CATEGORY_LIST_REQUEST });
  try {
    const { data } = await Axios.get("/api/product-categories");
    dispatch({ type: PRODUCT_CATEGORY_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: PRODUCT_CATEGORY_LIST_FAIL, payload: error.message });
  }
};

export const createProductCategory = (name, isClothing) => async (dispatch) => {
  dispatch({ type: PRODUCT_CATEGORY_CREATE_REQUEST });
  try {
    const { data } = await Axios.post("/api/product-categories", { name, isClothing });
    dispatch({ type: PRODUCT_CATEGORY_CREATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: PRODUCT_CATEGORY_CREATE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const deleteProductCategory = (id) => async (dispatch) => {
  dispatch({ type: PRODUCT_CATEGORY_DELETE_REQUEST });
  try {
    await Axios.delete(`/api/product-categories/${id}`);
    dispatch({ type: PRODUCT_CATEGORY_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: PRODUCT_CATEGORY_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
