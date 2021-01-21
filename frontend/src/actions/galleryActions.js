import Axios from "axios";
import {
  GALLERY_IMAGE_LIST_FAIL,
  GALLERY_IMAGE_LIST_REQUEST,
  GALLERY_IMAGE_LIST_SUCCESS,
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
