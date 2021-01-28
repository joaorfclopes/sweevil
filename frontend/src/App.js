import React, { useEffect, useState } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { useSelector } from "react-redux";
import $ from "jquery";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import MenuMobile from "./components/MenuMobile";
import SigninScreen from "./screens/SigninScreen";
import ShopScreen from "./screens/ShopScreen";
import ProductScreen from "./screens/ProductScreen";
import CartScreen from "./screens/CartScreen";
import ShippingScreen from "./screens/ShippingScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import OrderScreen from "./screens/OrderScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import AdminScreen from "./screens/AdminScreen";
import ProductEditScreen from "./screens/ProductEditScreen";
import AboutScreen from "./screens/AboutScreen";
import GalleryScreen from "./screens/GalleryScreen";
import NotFoundScreen from "./screens/NotFoundScreen";
import HomeScreen from "./screens/HomeScreen";

export default function App() {
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const [loading, setLoading] = useState(true);

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
      $(".loading").css({ display: "none" });
      document.body.classList.add("scroll");
    }, 1200);
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <div className="grid-container">
          <Navbar />
          <MenuMobile />
          {!loading && (
            <main>
              <AnimatePresence>
                <Switch>
                  <Route
                    exact
                    path="/"
                    render={(props) => (
                      <HomeScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                  <Route
                    path="/about"
                    render={(props) => (
                      <AboutScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                  <Route
                    path="/gallery"
                    render={(props) => (
                      <GalleryScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/shop"
                    render={(props) => (
                      <ShopScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/shop/product/:id"
                    render={(props) => (
                      <ProductScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/cart"
                    render={(props) => (
                      <CartScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                  <Route
                    path="/cart/shipping"
                    render={(props) => (
                      <ShippingScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                  <Route
                    path="/cart/placeorder"
                    render={(props) => (
                      <PlaceOrderScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                  <Route
                    path="/cart/order/:id"
                    render={(props) => (
                      <OrderScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                  <Route
                    path="/signin"
                    render={(props) => (
                      <SigninScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/admin"
                    render={(props) =>
                      userInfo ? (
                        <AdminScreen
                          {...props}
                          pageVariants={pageVariants}
                          pageTransition={pageTransition}
                        />
                      ) : (
                        <Redirect to="/signin" />
                      )
                    }
                  />
                  <Route
                    path="/admin/product/:id/edit"
                    render={(props) =>
                      userInfo ? (
                        <ProductEditScreen
                          {...props}
                          pageVariants={pageVariants}
                          pageTransition={pageTransition}
                        />
                      ) : (
                        <Redirect to="/signin" />
                      )
                    }
                  />
                  <Route
                    path="/forgotPassword"
                    render={(props) => (
                      <ForgotPasswordScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                  <Route
                    path="/resetPassword/:id"
                    render={(props) => (
                      <ResetPasswordScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                  <Route
                    render={(props) => (
                      <NotFoundScreen
                        {...props}
                        pageVariants={pageVariants}
                        pageTransition={pageTransition}
                      />
                    )}
                  />
                </Switch>
              </AnimatePresence>
            </main>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}
