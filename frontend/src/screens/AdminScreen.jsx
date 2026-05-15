import { motion } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { signout } from '../actions/userActions';
import PasskeyRegister from '../components/PasskeyRegister';
import { useFeatures } from '../FeaturesContext';
import { scrollTop } from '../utils.js';

const AboutAdminTab = lazy(() => import('../components/AboutAdminTab'));
const BookingsAdminTab = lazy(() => import('../components/BookingsAdminTab'));
const GalleryAdminTab = lazy(() => import('../components/GalleryAdminTab'));
const OrdersTable = lazy(() => import('../components/OrdersTable'));
const ProductsTable = lazy(() => import('../components/ProductsTable'));

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
    <motion.section
      className="admin-screen"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <div className="logout-container">
        <PasskeyRegister />
        <Link to="/">
          <button className="primary" onClick={signoutHandler}>
            Log Out
          </button>
        </Link>
      </div>
      <Suspense fallback={null}>
        {bookingEnabled && <BookingsAdminTab />}
        <OrdersTable />
        <ProductsTable />
        <GalleryAdminTab />
        <AboutAdminTab />
      </Suspense>
    </motion.section>
  );
}
