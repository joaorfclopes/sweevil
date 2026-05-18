import Axios from 'axios';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { authClient } from './lib/authClient';
import {
  availabilityCreateReducer,
  availabilityDeleteReducer,
  availabilityListReducer,
  availabilityUpdateReducer,
  bookingCancelReducer,
  bookingDeleteReducer,
  bookingListReducer,
} from './reducers/bookingReducers';
import { cartReducer } from './reducers/cartReducers';
import {
  categoryCreateReducer,
  categoryDeleteReducer,
  categoryListReducer,
  categoryUpdateReducer,
} from './reducers/categoryReducers';
import {
  galleryImageCreateReducer,
  galleryImageDeleteReducer,
  galleryImageListReducer,
  galleryImageUpdateReducer,
} from './reducers/galleryReducers';
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
} from './reducers/orderReducers';
import {
  productCategoryCreateReducer,
  productCategoryDeleteReducer,
  productCategoryListReducer,
} from './reducers/productCategoryReducers';
import {
  productAdminListReducer,
  productCreateReducer,
  productDeleteReducer,
  productDetailsReducer,
  productListReducer,
  productUpdateReducer,
} from './reducers/productReducers';
import { userDetailsReducer, userSigninReducer, userUpdateReducer } from './reducers/userReducers';

const storedUserInfo = (() => {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('userInfo');
    return null;
  }
})();

const initialState = {
  userSignin: {
    userInfo: storedUserInfo,
  },
  cart: {
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {},
  },
};

const reducer = combineReducers({
  productAdminList: productAdminListReducer,
  productList: productListReducer,
  productDetails: productDetailsReducer,
  productCreate: productCreateReducer,
  productUpdate: productUpdateReducer,
  productDelete: productDeleteReducer,
  cart: cartReducer,
  userSignin: userSigninReducer,
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

const store = createStore(reducer, initialState, composeEnhancer(applyMiddleware(thunk)));

Axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      store.dispatch({ type: 'USER_SIGNOUT' });
      await authClient.signOut().catch(() => {});
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default store;
