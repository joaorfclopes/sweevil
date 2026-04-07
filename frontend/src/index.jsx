import React from "react";
import { createRoot } from "react-dom/client";
import smoothscroll from "smoothscroll-polyfill";
import "notyf/notyf.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "yet-another-react-lightbox/styles.css";
import "./style/index.scss";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store";

smoothscroll.polyfill();

window.__forceSmoothScrollPolyfill__ = true;

const root = createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

