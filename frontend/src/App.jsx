import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { listOrders } from './actions/orderActions';
import { listAdminProducts } from './actions/productActions';
import { signout } from './actions/userActions';
import ArrowUp from './components/ArrowUp';
import ConsentNotice from './components/ConsentNotice';
import Footer from './components/Footer';
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
import { mainOptions, scrollWithOffset } from './utils';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function PasskeyPreloader({ onReady }) {
  const { isPending } = authClient.useListPasskeys();
  useEffect(() => {
    if (!isPending) onReady();
  }, [isPending]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function AppContent() {
  const dispatch = useDispatch();
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const location = useLocation();
  const idleTimer = useRef(null);
  const { maintenanceMode } = useFeatures();

  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const spinnerHidden = useRef(false);
  const isAdminPage = useRef(window.location.pathname.startsWith('/admin')).current;

  const { loading: productsLoading } = useSelector((state) => state.productAdminList);
  const { loading: ordersLoading } = useSelector((state) => state.orderAdminList);

  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [passkeysReady, setPasskeysReady] = useState(false);

  useEffect(() => {
    if (sessionPending) return;
    if (window.location.hash === '') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
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

  const updateActiveSection = () => {
    if (window.location.pathname !== '/') return;
    const midpoint = window.innerHeight / 2;
    let current = 'home';
    for (const opt of mainOptions) {
      const el = document.getElementById(opt);
      if (el && el.getBoundingClientRect().top <= midpoint) {
        current = opt;
      }
    }
    setActiveSection(current);
  };

  const scroll = () => {
    window.addEventListener('scroll', function () {
      if (window.scrollY >= 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      const arrowUp = document.querySelector('.arrow-up');
      if (arrowUp) {
        if (window.scrollY >= 500) {
          arrowUp.classList.add('show');
          arrowUp.classList.remove('hide');
        } else {
          arrowUp.classList.add('hide');
          arrowUp.classList.remove('show');
        }
      }
      updateActiveSection();
    });
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
    const root = document.getElementById('root');
    if (isAdminPage) {
      root.style.opacity = '1';
    } else {
      root.classList.add('show');
    }
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
    const adminReady =
      !isAdminPage ||
      (productsLoading === false && ordersLoading === false && (!session || passkeysReady));
    if (adminReady) doHideSpinner();
  }, [minTimeElapsed, productsLoading, ordersLoading, session, passkeysReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    if (location.pathname === '/') {
      setActiveSection('home');
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
        {session && <PasskeyPreloader onReady={() => setPasskeysReady(true)} />}
        <Navbar scrolled={scrolled} activeSection={activeSection} />
        {!loading && (
          <>
            <main>
              <Routes>
                <Route
                  path="/"
                  element={isAuthError ? <Navigate to="/not-found" replace /> : <MainScreen />}
                />
                <Route path="/shop" element={<ShopScreen />} />
                <Route path="/shop/product/:id" element={<ProductScreen />} />
                <Route path="/cart" element={<CartScreen />} />
                <Route path="/cart/shipping" element={<ShippingScreen />} />
                <Route path="/cart/placeorder" element={<PlaceOrderScreen />} />
                <Route path="/cart/order/:token" element={<OrderScreen />} />
                <Route path="/signin" element={<SigninScreen />} />
                <Route path="/admin" element={userInfo ? <AdminScreen /> : null} />
                <Route
                  path="/admin/product/:id/edit"
                  element={userInfo ? <ProductEditScreen /> : <NotFoundScreen />}
                />
                <Route path="/booking" element={<BookingScreen />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditionsScreen />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyScreen />} />
                <Route path="/cookie-policy" element={<CookiePolicyScreen />} />
                <Route path="/right-of-withdrawal" element={<WithdrawalRightScreen />} />
                <Route path="/returns-policy" element={<ReturnPolicyScreen />} />
                <Route path="*" element={<NotFoundScreen />} />
              </Routes>
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
        <Suspense fallback={null}>
          <AppContent />
        </Suspense>
      </FeaturesProvider>
    </BrowserRouter>
  );
}
