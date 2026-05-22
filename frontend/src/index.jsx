import * as Sentry from '@sentry/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'notyf/notyf.min.css';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import 'yet-another-react-lightbox/styles.css';
import App from './App';
import './i18n';
import store from './store';
import './style/index.scss';

if (import.meta.env.MODE === 'production') {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    beforeSendLog(log) {
      const msg = log.body ?? '';
      if (/^FBNav|^hxp-chat-suppression|^dom_only/.test(msg)) return null;
      return log;
    },
    beforeSend(event) {
      const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
      if (frames.length === 0) return event;
      const fromExtension = frames.some((f) =>
        /^(chrome|moz|safari|edge)-extension:\/\//.test(f.filename ?? '')
      );
      if (fromExtension) return null;
      const allAnonymous = frames.every((f) => !f.filename || f.filename === '<anonymous>');
      if (allAnonymous) return null;
      return event;
    },
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.browserProfilingIntegration(),
      Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
      Sentry.replayIntegration(),
    ],
    enableLogs: true,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/sweevil\.pt\/api/],
  });
}

dayjs.extend(utc);

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <Sentry.ErrorBoundary fallback={<p>Algo correu mal. Por favor, atualize a página.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </Provider>
);
