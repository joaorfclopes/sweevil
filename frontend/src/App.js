import React, { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import $ from "jquery";
import Axios from "axios";
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
import PrivateRoute from "./components/PrivateRoute";
import AdminScreen from "./screens/AdminScreen";
import ProductEditScreen from "./screens/ProductEditScreen";
import AboutScreen from "./screens/AboutScreen";
import GalleryScreen from "./screens/GalleryScreen";

export default function App() {
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    setTimeout(() => {
      Axios.get("/api/products").then(() => {
        setLoading(false);
        $(".loading").css({ display: "none" });
      });
    }, 1200);
  }, []);

  return (
    <>
      {!loading && (
        <div className="App">
          <div className="grid-container">
            <Navbar />
            <MenuMobile />
            <main>
              <AnimatePresence exitBeforeEnter>
                <Switch location={location} key={location.pathname}>
                  <Route path="/shop" component={ShopScreen} exact />
                  <Route
                    path="/shop/product/:id"
                    component={ProductScreen}
                    exact
                  />
                  <Route path="/signin" component={SigninScreen} exact />
                  <PrivateRoute path="/admin" component={AdminScreen} exact />
                  <PrivateRoute
                    path="/admin/product/:id/edit"
                    component={ProductEditScreen}
                    exact
                  />
                  <Route
                    path="/forgotPassword"
                    component={ForgotPasswordScreen}
                    exact
                  />
                  <Route
                    path="/resetPassword/:id"
                    component={ResetPasswordScreen}
                  />
                  <Route path="/cart" component={CartScreen} exact />
                  <Route
                    path="/cart/shipping"
                    component={ShippingScreen}
                    exact
                  />
                  <Route
                    path="/cart/placeorder"
                    component={PlaceOrderScreen}
                    exact
                  />
                  <Route path="/cart/order/:id" component={OrderScreen} />
                  <Route path="/about" component={AboutScreen} />
                  <Route path="/gallery" component={GalleryScreen} />
                </Switch>
              </AnimatePresence>
            </main>
          </div>
        </div>
      )}
    </>
  );
}
