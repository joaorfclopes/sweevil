import { useTranslation } from 'react-i18next';

export default function PoliticaDevolucoes() {
  const { t } = useTranslation('return-policy');
  return (
    <section className="legal-screen custom-font">
      <h1>{t('title')}</h1>
      <span className="last-updated">{t('lastUpdated')}</span>

      <h2>{t('s1_title')}</h2>
      <p>{t('s1_p1')}</p>
      <ul>
        <li>{t('s1_li1')}</li>
        <li>{t('s1_li2')}</li>
        <li>{t('s1_li3')}</li>
      </ul>

      <h2>{t('s2_title')}</h2>
      <p>{t('s2_p1')}</p>
      <ul>
        <li>
          {t('s2_li1_email_label')}{' '}
          <a href="mailto:silvia.seixas.peralta@gmail.com">{t('s2_li1_email')}</a>
        </li>
        <li>{t('s2_li2')}</li>
      </ul>
      <p>{t('s2_p2')}</p>

      <h2>{t('s3_title')}</h2>
      <p>{t('s3_p1')}</p>

      <h2>{t('s4_title')}</h2>
      <p>{t('s4_p1')}</p>
      <ul>
        <li>{t('s4_li1')}</li>
        <li>{t('s4_li2')}</li>
        <li>{t('s4_li3')}</li>
        <li>{t('s4_li4')}</li>
      </ul>

      <h2>{t('s5_title')}</h2>
      <p>{t('s5_p1')}</p>

      <h2>{t('s6_title')}</h2>
      <p>
        {t('s6_p1')} <a href="mailto:silvia.seixas.peralta@gmail.com">{t('s6_email')}</a>{' '}
        {t('s6_p2')}
      </p>
    </section>
  );
}
