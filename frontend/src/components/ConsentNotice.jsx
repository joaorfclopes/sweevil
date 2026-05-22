import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useConsentState } from '../hooks/useConsentState';

export default function ConsentNotice() {
  const { t } = useTranslation();
  const { consent, acceptAll, rejectAll } = useConsentState();

  if (consent !== null) return null;

  return (
    <div className="consent-notice">
      <p>
        {t('consent.text')} <Link to="/cookie-policy">{t('consent.cookiePolicy')}</Link>.
      </p>
      <div className="consent-notice-actions">
        <button className="consent-notice-reject" onClick={rejectAll}>
          {t('consent.rejectAll')}
        </button>
        <button className="consent-notice-accept" onClick={acceptAll}>
          {t('consent.acceptAll')}
        </button>
      </div>
    </div>
  );
}
