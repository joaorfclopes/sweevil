import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import $ from "jquery";
import Axios from "axios";
import Navbar from "./components/Navbar";
import MenuMobile from "./components/MenuMobile";
import SigninScreen from "./screens/SigninScreen";
import ShopScreen from "./screens/ShopScreen";
import ProductScreen from "./screens/ProductScreen";
import CartScreen from "./screens/CartScreen";
import ShippingScreen from "./screens/ShippingScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import OrderScreen from "./screens/OrderScreen";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      Axios.get("/api/products").then(() => {
        setLoading(false);
        $(".loading").css({ display: "none" });
      });
    }, 1200);
  }, []);

  return (
    <BrowserRouter>
      {!loading && (
        <div className="App">
          <div className="grid-container">
            <Navbar />
            <MenuMobile />
            <main>
              <Switch>
                <Route path="/shop" component={ShopScreen} exact />
                <Route
                  path="/shop/product/:id"
                  component={ProductScreen}
                  exact
                />
                <Route path="/signin" component={SigninScreen} exact />
                <Route path="/cart" component={CartScreen} exact />
                <Route path="/cart/shipping" component={ShippingScreen} exact />
                <Route
                  path="/cart/placeorder"
                  component={PlaceOrderScreen}
                  exact
                />
                <Route path="/cart/order/:id" component={OrderScreen} />
              </Switch>
            </main>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
