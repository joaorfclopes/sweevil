import Axios from 'axios';
import {
  PRODUCT_CATEGORY_CREATE_FAIL,
  PRODUCT_CATEGORY_CREATE_REQUEST,
  PRODUCT_CATEGORY_CREATE_SUCCESS,
  PRODUCT_CATEGORY_DELETE_FAIL,
  PRODUCT_CATEGORY_DELETE_REQUEST,
  PRODUCT_CATEGORY_DELETE_SUCCESS,
  PRODUCT_CATEGORY_LIST_FAIL,
  PRODUCT_CATEGORY_LIST_REQUEST,
  PRODUCT_CATEGORY_LIST_SUCCESS,
  PRODUCT_CATEGORY_UPDATE_FAIL,
  PRODUCT_CATEGORY_UPDATE_REQUEST,
  PRODUCT_CATEGORY_UPDATE_SUCCESS,
} from '../constants/productCategoryConstants';
import { translateBackendMessage } from '../utils/translateError';

export const listProductCategories = () => async (dispatch) => {
  dispatch({ type: PRODUCT_CATEGORY_LIST_REQUEST });
  try {
    const { data } = await Axios.get('/api/product-categories');
    dispatch({ type: PRODUCT_CATEGORY_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: PRODUCT_CATEGORY_LIST_FAIL, payload: error.message });
  }
};

export const createProductCategory = (name, isClothing, nameEn, namePt) => async (dispatch) => {
  dispatch({ type: PRODUCT_CATEGORY_CREATE_REQUEST });
  try {
    const { data } = await Axios.post('/api/product-categories', {
      name,
      isClothing,
      nameEn,
      namePt,
    });
    dispatch({ type: PRODUCT_CATEGORY_CREATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: PRODUCT_CATEGORY_CREATE_FAIL,
      payload: translateBackendMessage(error.response?.data?.message) || error.message,
    });
  }
};

export const updateProductCategory = (id, name, isClothing, nameEn, namePt) => async (dispatch) => {
  dispatch({ type: PRODUCT_CATEGORY_UPDATE_REQUEST });
  try {
    const { data } = await Axios.put(`/api/product-categories/${id}`, {
      name,
      isClothing,
      nameEn,
      namePt,
    });
    dispatch({ type: PRODUCT_CATEGORY_UPDATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: PRODUCT_CATEGORY_UPDATE_FAIL,
      payload: translateBackendMessage(error.response?.data?.message) || error.message,
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
      payload: translateBackendMessage(error.response?.data?.message) || error.message,
    });
  }
};
