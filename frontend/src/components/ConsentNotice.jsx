import { Link } from 'react-router-dom';
import { useConsentState } from '../hooks/useConsentState';

export default function ConsentNotice() {
  const { consent, acceptAll, rejectAll } = useConsentState();

  if (consent !== null) return null;

  return (
    <div className="consent-notice">
      <p>
        We use cookies to analyse traffic and measure ad performance. See our{' '}
        <Link to="/cookie-policy">Cookie Policy</Link>.
      </p>
      <div className="consent-notice-actions">
        <button className="consent-notice-reject" onClick={rejectAll}>
          Reject All
        </button>
        <button className="consent-notice-accept" onClick={acceptAll}>
          Accept All
        </button>
      </div>
    </div>
  );
}
