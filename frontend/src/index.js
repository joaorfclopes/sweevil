import React from "react";
import ReactDOM from "react-dom";
import smoothscroll from "smoothscroll-polyfill";
import "notyf/notyf.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-image-lightbox/style.css";
import "./style/index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import SimpleReactLightbox from "simple-react-lightbox";
import store from "./store";

smoothscroll.polyfill();

window.__forceSmoothScrollPolyfill__ = true;

ReactDOM.render(
  <Provider store={store}>
    <SimpleReactLightbox>
      <App />
    </SimpleReactLightbox>
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
