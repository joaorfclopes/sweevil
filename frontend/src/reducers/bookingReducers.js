import {
  AVAILABILITY_CREATE_FAIL,
  AVAILABILITY_CREATE_REQUEST,
  AVAILABILITY_CREATE_RESET,
  AVAILABILITY_CREATE_SUCCESS,
  AVAILABILITY_DELETE_FAIL,
  AVAILABILITY_DELETE_REQUEST,
  AVAILABILITY_DELETE_RESET,
  AVAILABILITY_DELETE_SUCCESS,
  AVAILABILITY_LIST_FAIL,
  AVAILABILITY_LIST_REQUEST,
  AVAILABILITY_LIST_SUCCESS,
  AVAILABILITY_UPDATE_FAIL,
  AVAILABILITY_UPDATE_REQUEST,
  AVAILABILITY_UPDATE_RESET,
  AVAILABILITY_UPDATE_SUCCESS,
  BOOKING_CANCEL_FAIL,
  BOOKING_CANCEL_REQUEST,
  BOOKING_CANCEL_RESET,
  BOOKING_CANCEL_SUCCESS,
  BOOKING_DELETE_FAIL,
  BOOKING_DELETE_REQUEST,
  BOOKING_DELETE_RESET,
  BOOKING_DELETE_SUCCESS,
  BOOKING_LIST_FAIL,
  BOOKING_LIST_REQUEST,
  BOOKING_LIST_SUCCESS,
} from "../constants/bookingConstants";

export const bookingListReducer = (state = { bookings: [] }, action) => {
  switch (action.type) {
    case BOOKING_LIST_REQUEST:
      return { loading: true };
    case BOOKING_LIST_SUCCESS:
      return { loading: false, bookings: action.payload };
    case BOOKING_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const bookingCancelReducer = (state = {}, action) => {
  switch (action.type) {
    case BOOKING_CANCEL_REQUEST:
      return { loading: true };
    case BOOKING_CANCEL_SUCCESS:
      return { loading: false, success: true };
    case BOOKING_CANCEL_FAIL:
      return { loading: false, error: action.payload };
    case BOOKING_CANCEL_RESET:
      return {};
    default:
      return state;
  }
};

export const bookingDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case BOOKING_DELETE_REQUEST:
      return { loading: true };
    case BOOKING_DELETE_SUCCESS:
      return { loading: false, success: true };
    case BOOKING_DELETE_FAIL:
      return { loading: false, error: action.payload };
    case BOOKING_DELETE_RESET:
      return {};
    default:
      return state;
  }
};

export const availabilityListReducer = (state = { availability: [] }, action) => {
  switch (action.type) {
    case AVAILABILITY_LIST_REQUEST:
      return { loading: true };
    case AVAILABILITY_LIST_SUCCESS:
      return { loading: false, availability: action.payload };
    case AVAILABILITY_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const availabilityCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case AVAILABILITY_CREATE_REQUEST:
      return { loading: true };
    case AVAILABILITY_CREATE_SUCCESS:
      return { loading: false, success: true };
    case AVAILABILITY_CREATE_FAIL:
      return { loading: false, error: action.payload };
    case AVAILABILITY_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const availabilityUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case AVAILABILITY_UPDATE_REQUEST:
      return { loading: true };
    case AVAILABILITY_UPDATE_SUCCESS:
      return { loading: false, success: true };
    case AVAILABILITY_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case AVAILABILITY_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};

export const availabilityDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case AVAILABILITY_DELETE_REQUEST:
      return { loading: true };
    case AVAILABILITY_DELETE_SUCCESS:
      return { loading: false, success: true };
    case AVAILABILITY_DELETE_FAIL:
      return { loading: false, error: action.payload };
    case AVAILABILITY_DELETE_RESET:
      return {};
    default:
      return state;
  }
};
