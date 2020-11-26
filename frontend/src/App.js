import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import $ from "jquery";
import Navbar from "./components/Navbar";
import MenuMobile from "./components/MenuMobile";
import AdminScreen from "./screens/AdminScreen";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      $(".loading").css({ display: "none" });
    }, 1500);
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
                <Route exact path="/admin" component={AdminScreen} />
              </Switch>
            </main>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
