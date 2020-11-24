import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomeScreen from "./screens/HomeScreen";

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <main>
          <Switch>
            <Route path="/" component={HomeScreen} exact />
          </Switch>
        </main>
      </div>
    </BrowserRouter>
  );
}
