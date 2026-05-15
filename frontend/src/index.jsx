import * as Sentry from '@sentry/react';
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

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.browserProfilingIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
  ],
  enableLogs: true,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  tracePropagationTargets: ['localhost', /^https:\/\/sweevil\.pt\/api/],
});

smoothscroll.polyfill();

window.__forceSmoothScrollPolyfill__ = true;

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong. Please refresh.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </Provider>
);
