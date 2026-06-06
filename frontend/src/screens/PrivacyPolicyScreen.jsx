import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function PoliticaPrivacidadeScreen() {
  const { t } = useTranslation('privacy-policy');
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
      <p>
        {t('s1_p2')} <a href="mailto:silvia.seixas.peralta@gmail.com">{t('s1_email')}</a>
      </p>

      <h2>{t('s2_title')}</h2>
      <p>{t('s2_p1')}</p>
      <ul>
        <li>{t('s2_li1')}</li>
        <li>{t('s2_li2')}</li>
        <li>{t('s2_li3')}</li>
        <li>{t('s2_li4')}</li>
        <li>{t('s2_li5')}</li>
      </ul>

      <h2>{t('s3_title')}</h2>
      <p>{t('s3_p1')}</p>
      <ul>
        <li>{t('s3_li1')}</li>
        <li>{t('s3_li2')}</li>
        <li>{t('s3_li3')}</li>
      </ul>

      <h2>{t('s4_title')}</h2>
      <p>{t('s4_p1')}</p>

      <h2>{t('s5_title')}</h2>
      <p>{t('s5_p1')}</p>

      <h2>{t('s6_title')}</h2>
      <p>{t('s6_p1')}</p>
      <ul>
        <li>{t('s6_li1')}</li>
        <li>{t('s6_li2')}</li>
        <li>{t('s6_li3')}</li>
        <li>{t('s6_li4')}</li>
        <li>{t('s6_li5')}</li>
        <li>
          {t('s6_li6')}{' '}
          <a href="https://www.cnpd.pt" target="_blank" rel="noreferrer">
            {t('s6_li6_link')}
          </a>
        </li>
      </ul>
      <p>
        {t('s6_p2')} <a href="mailto:silvia.seixas.peralta@gmail.com">{t('s6_p2_email')}</a>.
      </p>

      <h2>{t('s7_title')}</h2>
      <p>{t('s7_p1')}</p>
    </section>
  );
}
