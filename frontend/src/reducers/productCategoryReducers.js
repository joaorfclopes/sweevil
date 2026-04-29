import {
  PRODUCT_CATEGORY_LIST_REQUEST,
  PRODUCT_CATEGORY_LIST_SUCCESS,
  PRODUCT_CATEGORY_LIST_FAIL,
  PRODUCT_CATEGORY_CREATE_REQUEST,
  PRODUCT_CATEGORY_CREATE_SUCCESS,
  PRODUCT_CATEGORY_CREATE_FAIL,
  PRODUCT_CATEGORY_CREATE_RESET,
  PRODUCT_CATEGORY_DELETE_REQUEST,
  PRODUCT_CATEGORY_DELETE_SUCCESS,
  PRODUCT_CATEGORY_DELETE_FAIL,
  PRODUCT_CATEGORY_DELETE_RESET,
} from "../constants/productCategoryConstants";

export const productCategoryListReducer = (state = { categories: [] }, action) => {
  switch (action.type) {
    case PRODUCT_CATEGORY_LIST_REQUEST:
      return { loading: true, categories: [] };
    case PRODUCT_CATEGORY_LIST_SUCCESS:
      return { loading: false, categories: action.payload };
    case PRODUCT_CATEGORY_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const productCategoryCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case PRODUCT_CATEGORY_CREATE_REQUEST:
      return { loading: true };
    case PRODUCT_CATEGORY_CREATE_SUCCESS:
      return { loading: false, success: true, category: action.payload };
    case PRODUCT_CATEGORY_CREATE_FAIL:
      return { loading: false, error: action.payload };
    case PRODUCT_CATEGORY_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const productCategoryDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case PRODUCT_CATEGORY_DELETE_REQUEST:
      return { loading: true };
    case PRODUCT_CATEGORY_DELETE_SUCCESS:
      return { loading: false, success: true };
    case PRODUCT_CATEGORY_DELETE_FAIL:
      return { loading: false, error: action.payload };
    case PRODUCT_CATEGORY_DELETE_RESET:
      return {};
    default:
      return state;
  }
};
