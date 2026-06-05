import { USER_SIGNOUT } from '../constants/userConstants';
import { authClient } from '../lib/authClient';

export const signout = () => async (dispatch) => {
  await authClient.signOut();
  localStorage.removeItem('userInfo');
  localStorage.removeItem('cartItems');
  localStorage.removeItem('shippingDetails');
  localStorage.removeItem('billingDetails');
  localStorage.removeItem('vatNif');
  localStorage.removeItem('sameAsShipping');
  dispatch({ type: USER_SIGNOUT });
};
