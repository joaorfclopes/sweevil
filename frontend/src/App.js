import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import $ from "jquery";
import Axios from "axios";
import Navbar from "./components/Navbar";
import MenuMobile from "./components/MenuMobile";
import HomeScreen from "./screens/HomeScreen";
import SigninScreen from "./screens/SigninScreen";
import ShopScreen from "./screens/ShopScreen";

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
                <Route path="/shop" component={ShopScreen} />
                <Route path="/signin" component={SigninScreen} />
                <Route path="/" component={HomeScreen} exact />
              </Switch>
            </main>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
