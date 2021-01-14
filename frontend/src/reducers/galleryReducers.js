const {
  GALLERY_IMAGE_LIST_FAIL,
  GALLERY_IMAGE_LIST_REQUEST,
  GALLERY_IMAGE_LIST_SUCCESS,
  GALLERY_IMAGE_CREATE_REQUEST,
  GALLERY_IMAGE_CREATE_SUCCESS,
  GALLERY_IMAGE_CREATE_FAIL,
  GALLERY_IMAGE_CREATE_RESET,
  GALLERY_IMAGE_DELETE_REQUEST,
  GALLERY_IMAGE_DELETE_SUCCESS,
  GALLERY_IMAGE_DELETE_FAIL,
  GALLERY_IMAGE_DELETE_RESET,
} = require("../constants/galleryConstants");

export const galleryImageListReducer = (state = { gallery: [] }, action) => {
  switch (action.type) {
    case GALLERY_IMAGE_LIST_REQUEST:
      return { loading: true };
    case GALLERY_IMAGE_LIST_SUCCESS:
      return { loading: false, gallery: action.payload };
    case GALLERY_IMAGE_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const galleryImageCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case GALLERY_IMAGE_CREATE_REQUEST:
      return { loading: true };
    case GALLERY_IMAGE_CREATE_SUCCESS:
      return { loading: false, success: true, galleryImage: action.payload };
    case GALLERY_IMAGE_CREATE_FAIL:
      return { loading: false, error: action.payload };
    case GALLERY_IMAGE_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const galleryImageDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case GALLERY_IMAGE_DELETE_REQUEST:
      return { loading: true };
    case GALLERY_IMAGE_DELETE_SUCCESS:
      return { loading: false, success: true };
    case GALLERY_IMAGE_DELETE_FAIL:
      return { loading: false, error: action.payload };
    case GALLERY_IMAGE_DELETE_RESET:
      return {};
    default:
      return state;
  }
};
