import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar";
import MenuMobile from "./components/MenuMobile";
import HomeScreen from "./screens/HomeScreen";

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <div className="grid-container">
          <Navbar />
          <MenuMobile />
          <main>
            <Switch>
              <Route exact path="/" component={HomeScreen} />
            </Switch>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
