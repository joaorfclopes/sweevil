import Axios from "axios";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { thunk } from "redux-thunk";
import { cartReducer } from "./reducers/cartReducers";
import {
  orderAdminListReducer,
  orderCancelReducer,
  orderCreateReducer,
  orderDeleteReducer,
  orderDeliverReducer,
  orderDetailsReducer,
  orderListReducer,
  orderPayReducer,
  orderSendReducer,
} from "./reducers/orderReducers";
import {
  productCreateReducer,
  productDeleteReducer,
  productDetailsReducer,
  productListReducer,
  productUpdateReducer,
} from "./reducers/productReducers";
import {
  userDetailsReducer,
  userRegisterReducer,
  userSigninReducer,
  userUpdateReducer,
} from "./reducers/userReducers";
import {
  galleryImageListReducer,
  galleryImageCreateReducer,
  galleryImageUpdateReducer,
  galleryImageDeleteReducer,
} from "./reducers/galleryReducers";
import {
  categoryListReducer,
  categoryCreateReducer,
  categoryUpdateReducer,
  categoryDeleteReducer,
} from "./reducers/categoryReducers";
import {
  productCategoryListReducer,
  productCategoryCreateReducer,
  productCategoryDeleteReducer,
} from "./reducers/productCategoryReducers";
import {
  bookingListReducer,
  bookingCancelReducer,
  bookingDeleteReducer,
  availabilityListReducer,
  availabilityCreateReducer,
  availabilityUpdateReducer,
  availabilityDeleteReducer,
} from "./reducers/bookingReducers";

const storedUserInfo = (() => {
  try {
    const raw = localStorage.getItem("userInfo");
    if (!raw) return null;
    const info = JSON.parse(raw);
    if (!info?.token) return null;
    const payload = JSON.parse(atob(info.token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("userInfo");
      return null;
    }
    return info;
  } catch {
    localStorage.removeItem("userInfo");
    return null;
  }
})();

const initialState = {
  userSignin: {
    userInfo: storedUserInfo,
  },
  cart: {
    cartItems: localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [],
    shippingAddress: localStorage.getItem("shippingAddress")
      ? JSON.parse(localStorage.getItem("shippingAddress"))
      : {},
  },
};

const reducer = combineReducers({
  productList: productListReducer,
  productDetails: productDetailsReducer,
  productCreate: productCreateReducer,
  productUpdate: productUpdateReducer,
  productDelete: productDeleteReducer,
  cart: cartReducer,
  userSignin: userSigninReducer,
  userRegister: userRegisterReducer,
  userDetails: userDetailsReducer,
  userUpdate: userUpdateReducer,
  orderCreate: orderCreateReducer,
  orderDetails: orderDetailsReducer,
  orderPay: orderPayReducer,
  orderList: orderListReducer,
  orderAdminList: orderAdminListReducer,
  orderDelete: orderDeleteReducer,
  orderSend: orderSendReducer,
  orderDeliver: orderDeliverReducer,
  orderCancel: orderCancelReducer,
  galleryImageList: galleryImageListReducer,
  galleryImageCreate: galleryImageCreateReducer,
  galleryImageUpdate: galleryImageUpdateReducer,
  galleryImageDelete: galleryImageDeleteReducer,
  categoryList: categoryListReducer,
  categoryCreate: categoryCreateReducer,
  categoryUpdate: categoryUpdateReducer,
  categoryDelete: categoryDeleteReducer,
  productCategoryList: productCategoryListReducer,
  productCategoryCreate: productCategoryCreateReducer,
  productCategoryDelete: productCategoryDeleteReducer,
  bookingList: bookingListReducer,
  bookingCancel: bookingCancelReducer,
  bookingDelete: bookingDeleteReducer,
  availabilityList: availabilityListReducer,
  availabilityCreate: availabilityCreateReducer,
  availabilityUpdate: availabilityUpdateReducer,
  availabilityDelete: availabilityDeleteReducer,
});

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducer,
  initialState,
  composeEnhancer(applyMiddleware(thunk))
);

Axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("userInfo");
      store.dispatch({ type: "USER_SIGNOUT" });
    }
    return Promise.reject(error);
  }
);

export default store;
