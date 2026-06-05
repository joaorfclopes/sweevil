import * as Sentry from '@sentry/react';
import Axios from 'axios';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { authClient } from './lib/authClient';
import {
  availabilityBulkCreateReducer,
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
  orderDismissRefundReducer,
  orderListReducer,
  orderPayReducer,
  orderRefundReducer,
  orderSendReducer,
} from './reducers/orderReducers';
import {
  productCategoryCreateReducer,
  productCategoryDeleteReducer,
  productCategoryListReducer,
  productCategoryUpdateReducer,
} from './reducers/productCategoryReducers';
import {
  productAdminListReducer,
  productCreateReducer,
  productDeleteReducer,
  productDetailsReducer,
  productListReducer,
  productReorderReducer,
  productUpdateReducer,
} from './reducers/productReducers';
import { userSigninReducer } from './reducers/userReducers';

const sentryMiddleware = () => (next) => (action) => {
  if (typeof action.type === 'string' && action.type.endsWith('_FAIL') && action.payload) {
    if (action.statusCode !== 404) {
      Sentry.captureMessage(`Redux: ${action.type}`, {
        level: 'error',
        extra: { payload: action.payload },
      });
    }
  }
  return next(action);
};

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
    shippingDetails: localStorage.getItem('shippingDetails')
      ? JSON.parse(localStorage.getItem('shippingDetails'))
      : {},
    billingDetails: localStorage.getItem('billingDetails')
      ? JSON.parse(localStorage.getItem('billingDetails'))
      : null,
    vatNif: localStorage.getItem('vatNif') || '',
  },
};

const reducer = combineReducers({
  productAdminList: productAdminListReducer,
  productList: productListReducer,
  productDetails: productDetailsReducer,
  productCreate: productCreateReducer,
  productUpdate: productUpdateReducer,
  productDelete: productDeleteReducer,
  productReorder: productReorderReducer,
  cart: cartReducer,
  userSignin: userSigninReducer,
  orderCreate: orderCreateReducer,
  orderDetails: orderDetailsReducer,
  orderPay: orderPayReducer,
  orderList: orderListReducer,
  orderAdminList: orderAdminListReducer,
  orderDelete: orderDeleteReducer,
  orderSend: orderSendReducer,
  orderDeliver: orderDeliverReducer,
  orderCancel: orderCancelReducer,
  orderRefund: orderRefundReducer,
  orderDismissRefund: orderDismissRefundReducer,
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
  productCategoryUpdate: productCategoryUpdateReducer,
  productCategoryDelete: productCategoryDeleteReducer,
  bookingList: bookingListReducer,
  bookingCancel: bookingCancelReducer,
  bookingDelete: bookingDeleteReducer,
  availabilityList: availabilityListReducer,
  availabilityCreate: availabilityCreateReducer,
  availabilityUpdate: availabilityUpdateReducer,
  availabilityDelete: availabilityDeleteReducer,
  availabilityBulkCreate: availabilityBulkCreateReducer,
});

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducer,
  initialState,
  composeEnhancer(applyMiddleware(thunk, sentryMiddleware))
);

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
