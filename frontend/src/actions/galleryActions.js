import Axios from "axios";
import {
  GALLERY_IMAGE_LIST_FAIL,
  GALLERY_IMAGE_LIST_REQUEST,
  GALLERY_IMAGE_LIST_SUCCESS,
  GALLERY_IMAGE_CREATE_REQUEST,
  GALLERY_IMAGE_CREATE_SUCCESS,
  GALLERY_IMAGE_CREATE_FAIL,
  GALLERY_IMAGE_UPDATE_REQUEST,
  GALLERY_IMAGE_UPDATE_SUCCESS,
  GALLERY_IMAGE_UPDATE_FAIL,
  GALLERY_IMAGE_DELETE_REQUEST,
  GALLERY_IMAGE_DELETE_SUCCESS,
  GALLERY_IMAGE_DELETE_FAIL,
  GALLERY_IMAGE_REORDER_REQUEST,
  GALLERY_IMAGE_REORDER_SUCCESS,
  GALLERY_IMAGE_REORDER_FAIL,
} from "../constants/galleryConstants";

export const listGalleryImages = () => async (dispatch) => {
  dispatch({ type: GALLERY_IMAGE_LIST_REQUEST });
  try {
    const { data } = await Axios.get("/api/gallery");
    dispatch({ type: GALLERY_IMAGE_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: GALLERY_IMAGE_LIST_FAIL, payload: error.message });
  }
};

export const createGalleryImage =
  (imageData) => async (dispatch, getState) => {
    dispatch({ type: GALLERY_IMAGE_CREATE_REQUEST });
    const {
      userSignin: { userInfo },
    } = getState();
    try {
      const { data } = await Axios.post("/api/gallery", imageData, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: GALLERY_IMAGE_CREATE_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: GALLERY_IMAGE_CREATE_FAIL,
        payload: error.response?.data?.message || error.message,
      });
    }
  };

export const updateGalleryImage =
  (id, imageData) => async (dispatch, getState) => {
    dispatch({ type: GALLERY_IMAGE_UPDATE_REQUEST });
    const {
      userSignin: { userInfo },
    } = getState();
    try {
      const { data } = await Axios.put(`/api/gallery/${id}`, imageData, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: GALLERY_IMAGE_UPDATE_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: GALLERY_IMAGE_UPDATE_FAIL,
        payload: error.response?.data?.message || error.message,
      });
    }
  };

export const deleteGalleryImage = (id) => async (dispatch, getState) => {
  dispatch({ type: GALLERY_IMAGE_DELETE_REQUEST });
  const {
    userSignin: { userInfo },
  } = getState();
  try {
    await Axios.delete(`/api/gallery/${id}`, {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    });
    dispatch({ type: GALLERY_IMAGE_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: GALLERY_IMAGE_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const reorderGalleryImages = (items) => async (dispatch, getState) => {
  dispatch({ type: GALLERY_IMAGE_REORDER_REQUEST });
  const {
    userSignin: { userInfo },
  } = getState();
  try {
    await Axios.patch(
      "/api/gallery/reorder",
      { items },
      { headers: { Authorization: `Bearer ${userInfo.token}` } }
    );
    dispatch({ type: GALLERY_IMAGE_REORDER_SUCCESS });
  } catch (error) {
    dispatch({
      type: GALLERY_IMAGE_REORDER_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
