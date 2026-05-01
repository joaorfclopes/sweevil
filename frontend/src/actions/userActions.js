import { USER_SIGNOUT } from "../constants/userConstants";
import { authClient } from "../lib/authClient";

export const signout = () => async (dispatch) => {
  await authClient.signOut();
  localStorage.removeItem("userInfo");
  localStorage.removeItem("cartItems");
  localStorage.removeItem("shippingAddress");
  dispatch({ type: USER_SIGNOUT });
};
