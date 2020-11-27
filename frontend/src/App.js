import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import $ from "jquery";
import Navbar from "./components/Navbar";
import MenuMobile from "./components/MenuMobile";
import HomeScreen from "./screens/HomeScreen";
import SigninScreen from "./screens/SigninScreen";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    $(".loading").css({ display: "none" });
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
