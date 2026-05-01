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

export const createGalleryImage = (imageData) => async (dispatch) => {
  dispatch({ type: GALLERY_IMAGE_CREATE_REQUEST });
  try {
    const { data } = await Axios.post("/api/gallery", imageData);
    dispatch({ type: GALLERY_IMAGE_CREATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GALLERY_IMAGE_CREATE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const updateGalleryImage = (id, imageData) => async (dispatch) => {
  dispatch({ type: GALLERY_IMAGE_UPDATE_REQUEST });
  try {
    const { data } = await Axios.put(`/api/gallery/${id}`, imageData);
    dispatch({ type: GALLERY_IMAGE_UPDATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GALLERY_IMAGE_UPDATE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const deleteGalleryImage = (id) => async (dispatch) => {
  dispatch({ type: GALLERY_IMAGE_DELETE_REQUEST });
  try {
    await Axios.delete(`/api/gallery/${id}`);
    dispatch({ type: GALLERY_IMAGE_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: GALLERY_IMAGE_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const reorderGalleryImages = (items) => async (dispatch) => {
  dispatch({ type: GALLERY_IMAGE_REORDER_REQUEST });
  try {
    await Axios.patch("/api/gallery/reorder", { items });
    dispatch({ type: GALLERY_IMAGE_REORDER_SUCCESS });
    const { data } = await Axios.get("/api/gallery");
    dispatch({ type: GALLERY_IMAGE_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GALLERY_IMAGE_REORDER_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
