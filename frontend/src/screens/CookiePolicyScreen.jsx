import { useTranslation } from 'react-i18next';

export default function CookiePolicyScreen() {
  const { t } = useTranslation();
  return (
    <section className="legal-screen custom-font">
      <h1>{t('policy.cookiePolicy')}</h1>
      <span className="last-updated">Última atualização: 18 de maio de 2026</span>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files that a website stores on your device when you visit it. They
        are widely used to make websites work more efficiently and to provide information to site
        owners.
      </p>

      <h2>2. Cookies We Use</h2>
      <p>
        Sweevil (sweevil.pt) uses strictly necessary cookies required for the platform to function,
        and optional analytics and marketing cookies that are only activated with your consent.
      </p>

      <h3>2.1 Strictly Necessary Cookies</h3>
      <p>
        These cookies cannot be disabled. They do not require your consent under Law No. 41/2004.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Cookie</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Provider</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Purpose</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>better-auth.session_token</code>
            </td>
            <td style={{ padding: '8px' }}>sweevil.pt</td>
            <td style={{ padding: '8px' }}>Maintains your authenticated session</td>
            <td style={{ padding: '8px' }}>8 hours</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>_stripe_mid</code>
            </td>
            <td style={{ padding: '8px' }}>Stripe</td>
            <td style={{ padding: '8px' }}>Fraud prevention on payment pages</td>
            <td style={{ padding: '8px' }}>1 year</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>_stripe_sid</code>
            </td>
            <td style={{ padding: '8px' }}>Stripe</td>
            <td style={{ padding: '8px' }}>Fraud prevention on payment pages</td>
            <td style={{ padding: '8px' }}>30 minutes</td>
          </tr>
        </tbody>
      </table>

      <h3>2.2 Analytics Cookies (requires consent)</h3>
      <p>Set only when you accept analytics cookies in the cookie banner.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Cookie</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Provider</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Purpose</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>_ga</code>
            </td>
            <td style={{ padding: '8px' }}>Google Analytics</td>
            <td style={{ padding: '8px' }}>Distinguishes users for analytics reporting</td>
            <td style={{ padding: '8px' }}>2 years</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>_ga_HBQH4F9S1J</code>
            </td>
            <td style={{ padding: '8px' }}>Google Analytics</td>
            <td style={{ padding: '8px' }}>Persists session state for GA4 property</td>
            <td style={{ padding: '8px' }}>2 years</td>
          </tr>
        </tbody>
      </table>

      <h3>2.3 Marketing Cookies (requires consent)</h3>
      <p>Set only when you accept marketing cookies in the cookie banner.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Cookie</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Provider</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Purpose</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>_fbp</code>
            </td>
            <td style={{ padding: '8px' }}>Meta (Facebook)</td>
            <td style={{ padding: '8px' }}>Identifies browsers for ad delivery and attribution</td>
            <td style={{ padding: '8px' }}>3 months</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>_fbc</code>
            </td>
            <td style={{ padding: '8px' }}>Meta (Facebook)</td>
            <td style={{ padding: '8px' }}>Stores last click attribution from Facebook ads</td>
            <td style={{ padding: '8px' }}>3 months</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Local Storage</h2>
      <p>
        This site uses browser local storage for strictly necessary functionality. These are not
        cookies and do not require consent:
      </p>
      <ul>
        <li>
          <strong>userInfo</strong> — Stores your login state client-side.
        </li>
        <li>
          <strong>cartItems</strong> — Saves items in your shopping cart between visits.
        </li>
        <li>
          <strong>shippingAddress</strong> — Remembers your shipping address during checkout.
        </li>
        <li>
          <strong>trackingConsent</strong> — Records your cookie consent choice.
        </li>
      </ul>

      <h2>4. Legal Basis</h2>
      <p>
        Strictly necessary cookies do not require consent pursuant to Law No. 41/2004 and the
        ePrivacy Directive 2002/58/EC. Analytics and marketing cookies are processed based on your
        freely given consent (GDPR Art. 6(1)(a)), which you may withdraw at any time by clicking{' '}
        <strong>Reject All</strong> in the cookie banner.
      </p>

      <h2>5. Managing Cookies</h2>
      <p>You may also configure your browser to block or delete cookies:</p>
      <ul>
        <li>
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">
            Google Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/pt-PT/kb/ativar-desativar-cookies-websites"
            target="_blank"
            rel="noreferrer"
          >
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/pt-pt/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noreferrer"
          >
            Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/pt-pt/microsoft-edge/eliminar-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
            target="_blank"
            rel="noreferrer"
          >
            Microsoft Edge
          </a>
        </li>
      </ul>

      <h2>6. Contact</h2>
      <p>
        For questions related to this policy, contact us at{' '}
        <a href="mailto:silvia.seixas.peralta@gmail.com">silvia.seixas.peralta@gmail.com</a>.
      </p>
    </section>
  );
}
