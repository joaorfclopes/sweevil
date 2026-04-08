import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation
} from 'react-router-dom'
import { useSelector } from "react-redux";
import $ from "jquery";
import { AnimatePresence } from "framer-motion";
const CookieConsent = React.lazy(() =>
  import("react-cookie-consent").catch(() => ({ default: () => null }))
);
import Navbar from "./components/Navbar";
import MenuMobile from "./components/MenuMobile";
import Footer from "./components/Footer";
import SigninScreen from "./screens/SigninScreen";
import ShopScreen from "./screens/ShopScreen";
import ProductScreen from "./screens/ProductScreen";
import CartScreen from "./screens/CartScreen";
import ShippingScreen from "./screens/ShippingScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import OrderScreen from "./screens/OrderScreen";
import AdminScreen from "./screens/AdminScreen";
import ProductEditScreen from "./screens/ProductEditScreen";
import NotFoundScreen from "./screens/NotFoundScreen";
import TermosCondicoesScreen from "./screens/TermosCondicoesScreen";
import PoliticaPrivacidadeScreen from "./screens/PoliticaPrivacidadeScreen";
import PoliticaCookiesScreen from "./screens/PoliticaCookiesScreen";
import DireitoArrependimentoScreen from "./screens/DireitoArrependimentoScreen";
import PoliticaDevolucoes from "./screens/PoliticaDevolucoes";
import MainScreen from "./screens/MainScreen";
import ArrowUp from "./components/ArrowUp";

function AppContent() {
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = location.pathname.startsWith('/admin');
  const isMain = location.pathname === '/';

  const scroll = () => {
    $(window).on("scroll", function () {
      if ($(window).scrollTop() >= 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      if ($(window).scrollTop() >= 500) {
        $(".arrow-up").addClass("show");
        $(".arrow-up").removeClass("hide");
      } else {
        $(".arrow-up").addClass("hide");
        $(".arrow-up").removeClass("show");
      }
    });
  };

  const pageVariants = {
    in: {
      opacity: 1,
    },
    out: {
      opacity: 0,
    },
  };

  const pageTransition = {
    transition: "linear",
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      const loadingEl = document.querySelector(".loading");
      if (loadingEl) loadingEl.style.display = "none";
      document.body.classList.add("scroll");
      document.getElementById("root").classList.add("show");
      scroll();
      if (window.location.href.indexOf("#") > -1) {
        window.location.href = `${import.meta.env.VITE_HOME_PAGE}/${window.location.hash}`;
        window.scrollBy(0, -130);
      }
    }, 1200);
  }, []);

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
                      <MainScreen
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    }
                  />
                  <Route
                    path="/shop"
                    element={
                      <ShopScreen
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    }
                  />
                  <Route
                    path="/shop/product/:id"
                    element={
                      <ProductScreen
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <CartScreen
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    }
                  />
                  <Route
                    path="/cart/shipping"
                    element={
                      <ShippingScreen
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
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
                      <OrderScreen
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    }
                  />
                  <Route
                    path="/signin"
                    element={
                      <SigninScreen
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      userInfo ? (
                        <AdminScreen
                          pageVariants={pageVariants}
                          pageTransition={pageTransition}
                        />
                      ) : (
                        <Navigate to="/signin" replace />
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
                        <Navigate to="/signin" replace />
                      )
                    }
                  />
                  <Route path="/termos-e-condicoes" element={<TermosCondicoesScreen />} />
                  <Route path="/politica-de-privacidade" element={<PoliticaPrivacidadeScreen />} />
                  <Route path="/politica-de-cookies" element={<PoliticaCookiesScreen />} />
                  <Route path="/direito-de-arrependimento" element={<DireitoArrependimentoScreen />} />
                  <Route path="/politica-de-devolucoes" element={<PoliticaDevolucoes />} />
                  <Route
                    path="*"
                    element={
                      <NotFoundScreen
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
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
      <React.Suspense fallback={null}>
        <CookieConsent
          containerClasses="cookie-consent"
          contentClasses="cookie-consent-content custom-font"
          buttonClasses="cookie-consent-btn custom-font"
        >
          This website uses cookies to enhance the user experience.
        </CookieConsent>
      </React.Suspense>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  );
}
