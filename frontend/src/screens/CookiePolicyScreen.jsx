import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function CookiePolicyScreen() {
  const { t } = useTranslation('cookies');
  const navigate = useNavigate();
  return (
    <section className="legal-screen custom-font">
      <button className="back-button" onClick={() => navigate(-1)}>
        &#8592;
      </button>
      <h1>{t('title')}</h1>
      <span className="last-updated">{t('lastUpdated')}</span>

      <h2>{t('s1_title')}</h2>
      <p>{t('s1_p1')}</p>

      <h2>{t('s2_title')}</h2>
      <p>{t('s2_p1')}</p>

      <h3>{t('s2_1_title')}</h3>
      <p>{t('s2_1_p1')}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>{t('s2_1_table_header_cookie')}</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>{t('s2_1_table_header_provider')}</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>{t('s2_1_table_header_purpose')}</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>{t('s2_1_table_header_duration')}</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>{t('s2_1_row1_cookie')}</code>
            </td>
            <td style={{ padding: '8px' }}>{t('s2_1_row1_provider')}</td>
            <td style={{ padding: '8px' }}>{t('s2_1_row1_purpose')}</td>
            <td style={{ padding: '8px' }}>{t('s2_1_row1_duration')}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>{t('s2_1_row2_cookie')}</code>
            </td>
            <td style={{ padding: '8px' }}>{t('s2_1_row2_provider')}</td>
            <td style={{ padding: '8px' }}>{t('s2_1_row2_purpose')}</td>
            <td style={{ padding: '8px' }}>{t('s2_1_row2_duration')}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>{t('s2_1_row3_cookie')}</code>
            </td>
            <td style={{ padding: '8px' }}>{t('s2_1_row3_provider')}</td>
            <td style={{ padding: '8px' }}>{t('s2_1_row3_purpose')}</td>
            <td style={{ padding: '8px' }}>{t('s2_1_row3_duration')}</td>
          </tr>
        </tbody>
      </table>

      <h3>{t('s2_2_title')}</h3>
      <p>{t('s2_2_p1')}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>{t('s2_2_table_header_cookie')}</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>{t('s2_2_table_header_provider')}</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>{t('s2_2_table_header_purpose')}</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>{t('s2_2_table_header_duration')}</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>{t('s2_2_row1_cookie')}</code>
            </td>
            <td style={{ padding: '8px' }}>{t('s2_2_row1_provider')}</td>
            <td style={{ padding: '8px' }}>{t('s2_2_row1_purpose')}</td>
            <td style={{ padding: '8px' }}>{t('s2_2_row1_duration')}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>{t('s2_2_row2_cookie')}</code>
            </td>
            <td style={{ padding: '8px' }}>{t('s2_2_row2_provider')}</td>
            <td style={{ padding: '8px' }}>{t('s2_2_row2_purpose')}</td>
            <td style={{ padding: '8px' }}>{t('s2_2_row2_duration')}</td>
          </tr>
        </tbody>
      </table>

      <h3>{t('s2_3_title')}</h3>
      <p>{t('s2_3_p1')}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>{t('s2_3_table_header_cookie')}</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>{t('s2_3_table_header_provider')}</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>{t('s2_3_table_header_purpose')}</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>{t('s2_3_table_header_duration')}</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>{t('s2_3_row1_cookie')}</code>
            </td>
            <td style={{ padding: '8px' }}>{t('s2_3_row1_provider')}</td>
            <td style={{ padding: '8px' }}>{t('s2_3_row1_purpose')}</td>
            <td style={{ padding: '8px' }}>{t('s2_3_row1_duration')}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              <code>{t('s2_3_row2_cookie')}</code>
            </td>
            <td style={{ padding: '8px' }}>{t('s2_3_row2_provider')}</td>
            <td style={{ padding: '8px' }}>{t('s2_3_row2_purpose')}</td>
            <td style={{ padding: '8px' }}>{t('s2_3_row2_duration')}</td>
          </tr>
        </tbody>
      </table>

      <h2>{t('s3_title')}</h2>
      <p>{t('s3_p1')}</p>
      <ul>
        <li>
          <strong>{t('s3_li1')}</strong> — {t('s3_li1_desc')}
        </li>
        <li>
          <strong>{t('s3_li2')}</strong> — {t('s3_li2_desc')}
        </li>
        <li>
          <strong>{t('s3_li3')}</strong> — {t('s3_li3_desc')}
        </li>
        <li>
          <strong>{t('s3_li4')}</strong> — {t('s3_li4_desc')}
        </li>
      </ul>

      <h2>{t('s4_title')}</h2>
      <p>{t('s4_p1')}</p>

      <h2>{t('s5_title')}</h2>
      <p>{t('s5_p1')}</p>
      <ul>
        <li>
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">
            {t('s5_link_chrome')}
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/pt-PT/kb/ativar-desativar-cookies-websites"
            target="_blank"
            rel="noreferrer"
          >
            {t('s5_link_firefox')}
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/pt-pt/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noreferrer"
          >
            {t('s5_link_safari')}
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/pt-pt/microsoft-edge/eliminar-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
            target="_blank"
            rel="noreferrer"
          >
            {t('s5_link_edge')}
          </a>
        </li>
      </ul>

      <h2>{t('s6_title')}</h2>
      <p>
        {t('s6_p1')} <a href="mailto:silvia.seixas.peralta@gmail.com">{t('s6_email')}</a>.
      </p>
    </section>
  );
}
