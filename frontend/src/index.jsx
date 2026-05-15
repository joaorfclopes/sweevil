import 'notyf/notyf.min.css';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import smoothscroll from 'smoothscroll-polyfill';
import 'yet-another-react-lightbox/styles.css';
import App from './App';
import store from './store';
import './style/index.scss';

smoothscroll.polyfill();

window.__forceSmoothScrollPolyfill__ = true;

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
