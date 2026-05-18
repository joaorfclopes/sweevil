import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { signout } from '../actions/userActions';
import PasskeyRegister from '../components/PasskeyRegister';
import { useFeatures } from '../FeaturesContext';
import { scrollTop } from '../utils.js';

import AboutAdminTab from '../components/AboutAdminTab';
import BookingsAdminTab from '../components/BookingsAdminTab';
import GalleryAdminTab from '../components/GalleryAdminTab';
import OrdersTable from '../components/OrdersTable';
import ProductsTable from '../components/ProductsTable';

export default function AdminScreen(props) {
  const { bookingEnabled } = useFeatures();
  const dispatch = useDispatch();

  const signoutHandler = () => {
    dispatch(signout());
  };

  useEffect(() => {
    scrollTop();
  }, []);

  return (
    <section className="admin-screen">
      <div className="logout-container">
        <PasskeyRegister />
        <Link to="/">
          <button className="primary" onClick={signoutHandler}>
            Log Out
          </button>
        </Link>
      </div>
      <>
        {bookingEnabled && <BookingsAdminTab />}
        <OrdersTable />
        <ProductsTable />
        <GalleryAdminTab />
        <AboutAdminTab />
      </>
    </section>
  );
}
