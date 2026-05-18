import { AnimatePresence } from 'framer-motion';
import $ from 'jquery';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { listOrders } from './actions/orderActions';
import { listAdminProducts } from './actions/productActions';
import { signout } from './actions/userActions';
import ArrowUp from './components/ArrowUp';
import ConsentNotice from './components/ConsentNotice';
import Footer from './components/Footer';
import MenuMobile from './components/MenuMobile';
import Navbar from './components/Navbar';
import { USER_SIGNIN_SUCCESS, USER_SIGNOUT } from './constants/userConstants';
import { FeaturesProvider, useFeatures } from './FeaturesContext';
import { authClient } from './lib/authClient';
import AdminScreen from './screens/AdminScreen';
import BookingScreen from './screens/BookingScreen';
import CartScreen from './screens/CartScreen';
import CookiePolicyScreen from './screens/CookiePolicyScreen';
import MainScreen from './screens/MainScreen';
import MaintenanceScreen from './screens/MaintenanceScreen';
import NotFoundScreen from './screens/NotFoundScreen';
import OrderScreen from './screens/OrderScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import ProductScreen from './screens/ProductScreen';
import ReturnPolicyScreen from './screens/ReturnPolicyScreen';
import ShippingScreen from './screens/ShippingScreen';
import ShopScreen from './screens/ShopScreen';
import SigninScreen from './screens/SigninScreen';
import TermsAndConditionsScreen from './screens/TermsAndConditionsScreen';
import WithdrawalRightScreen from './screens/WithdrawalRightScreen';
import { scrollWithOffset } from './utils';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function AppContent() {
  const dispatch = useDispatch();
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const location = useLocation();
  const idleTimer = useRef(null);
  const { maintenanceMode } = useFeatures();

  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const spinnerHidden = useRef(false);
  const isAdminPage = useRef(window.location.pathname.startsWith('/admin')).current;

  const { loading: productsLoading } = useSelector((state) => state.productAdminList);
  const { loading: ordersLoading } = useSelector((state) => state.orderAdminList);

  const { data: session, isPending: sessionPending } = authClient.useSession();

  useEffect(() => {
    if (sessionPending) return;
    if (session?.user && !userInfo) {
      const { user } = session;
      const info = {
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.role === 'admin',
      };
      dispatch({ type: USER_SIGNIN_SUCCESS, payload: info });
      localStorage.setItem('userInfo', JSON.stringify(info));
    } else if (!session && !sessionPending && userInfo) {
      localStorage.removeItem('userInfo');
      dispatch({ type: USER_SIGNOUT });
    }
  }, [session, sessionPending]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAdmin = location.pathname.startsWith('/admin');
  const isMain = location.pathname === '/';
  const isAuthError =
    new URLSearchParams(location.search).get('error') === 'Registration_not_allowed_for_this_email';

  const scroll = () => {
    $(window).on('scroll', function () {
      if ($(window).scrollTop() >= 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      if ($(window).scrollTop() >= 500) {
        $('.arrow-up').addClass('show');
        $('.arrow-up').removeClass('hide');
      } else {
        $('.arrow-up').addClass('hide');
        $('.arrow-up').removeClass('show');
      }
    });
  };

  const pageVariants = {
    in: { opacity: 1 },
    out: { opacity: 1 },
  };

  const pageTransition = {
    duration: 0,
  };

  useEffect(() => {
    if (!userInfo) return;
    const reset = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(async () => {
        await authClient.signOut();
        dispatch(signout());
      }, IDLE_TIMEOUT_MS);
    };
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(idleTimer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [userInfo, dispatch]);

  const doHideSpinner = () => {
    if (spinnerHidden.current) return;
    spinnerHidden.current = true;
    setLoading(false);
    const loadingEl = document.querySelector('.loading');
    if (loadingEl) loadingEl.style.display = 'none';
    document.body.classList.add('scroll');
    document.getElementById('root').classList.add('show');
    scroll();
  };

  useEffect(() => {
    if (isAdminPage) {
      dispatch(listAdminProducts());
      dispatch(listOrders());
    }
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const minTimer = setTimeout(() => setMinTimeElapsed(true), 1200);
    const fallback = setTimeout(doHideSpinner, 5000);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(fallback);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!minTimeElapsed) return;
    const adminReady = !isAdminPage || (productsLoading === false && ordersLoading === false);
    if (adminReady) doHideSpinner();
  }, [minTimeElapsed, productsLoading, ordersLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [location.pathname]);

  // Scroll to hash section once content is rendered
  useEffect(() => {
    if (!loading && window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) scrollWithOffset(el);
    }
  }, [loading]);

  if (maintenanceMode) return <MaintenanceScreen />;

  return (
    <div className="App">
      <div className="grid-container">
        <Navbar scrolled={scrolled} />
        <MenuMobile />
        {!loading && (
          <>
            <main>
              <AnimatePresence>
                <Routes>
                  <Route
                    path="/"
                    element={
                      isAuthError ? (
                        <Navigate to="/not-found" replace />
                      ) : (
                        <MainScreen pageVariants={pageVariants} pageTransition={pageTransition} />
                      )
                    }
                  />
                  <Route
                    path="/shop"
                    element={
                      <ShopScreen pageVariants={pageVariants} pageTransition={pageTransition} />
                    }
                  />
                  <Route
                    path="/shop/product/:id"
                    element={
                      <ProductScreen pageVariants={pageVariants} pageTransition={pageTransition} />
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <CartScreen pageVariants={pageVariants} pageTransition={pageTransition} />
                    }
                  />
                  <Route
                    path="/cart/shipping"
                    element={
                      <ShippingScreen pageVariants={pageVariants} pageTransition={pageTransition} />
                    }
                  />
                  <Route
                    path="/cart/placeorder"
                    element={
                      <PlaceOrderScreen
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    }
                  />
                  <Route
                    path="/cart/order/:id"
                    element={
                      <OrderScreen pageVariants={pageVariants} pageTransition={pageTransition} />
                    }
                  />
                  <Route
                    path="/signin"
                    element={
                      <SigninScreen pageVariants={pageVariants} pageTransition={pageTransition} />
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      userInfo ? (
                        <AdminScreen pageVariants={pageVariants} pageTransition={pageTransition} />
                      ) : (
                        <NotFoundScreen
                          pageVariants={pageVariants}
                          pageTransition={pageTransition}
                        />
                      )
                    }
                  />
                  <Route
                    path="/admin/product/:id/edit"
                    element={
                      userInfo ? (
                        <ProductEditScreen
                          pageVariants={pageVariants}
                          pageTransition={pageTransition}
                        />
                      ) : (
                        <NotFoundScreen
                          pageVariants={pageVariants}
                          pageTransition={pageTransition}
                        />
                      )
                    }
                  />
                  <Route
                    path="/booking"
                    element={
                      <BookingScreen pageVariants={pageVariants} pageTransition={pageTransition} />
                    }
                  />
                  <Route path="/terms-and-conditions" element={<TermsAndConditionsScreen />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyScreen />} />
                  <Route path="/cookie-policy" element={<CookiePolicyScreen />} />
                  <Route path="/right-of-withdrawal" element={<WithdrawalRightScreen />} />
                  <Route path="/returns-policy" element={<ReturnPolicyScreen />} />
                  <Route
                    path="*"
                    element={
                      <NotFoundScreen pageVariants={pageVariants} pageTransition={pageTransition} />
                    }
                  />
                </Routes>
              </AnimatePresence>
            </main>
            {!isAdmin && <Footer showShopNow={isMain} />}
          </>
        )}
      </div>
      <ArrowUp />
      <ConsentNotice />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <FeaturesProvider>
        <AppContent />
      </FeaturesProvider>
    </BrowserRouter>
  );
}
