import { useTranslation } from 'react-i18next';

export default function TermosCondicoesScreen() {
  const { t } = useTranslation('terms');
  return (
    <section className="legal-screen custom-font">
      <h1>{t('title')}</h1>
      <span className="last-updated">{t('lastUpdated')}</span>

      <h2>{t('s1_title')}</h2>
      <p>{t('s1_p1')}</p>
      <p>
        {t('s1_p2')} <a href="mailto:silvia.seixas.peralta@gmail.com">{t('s1_email')}</a> |{' '}
        {t('s1_phone')}
      </p>

      <h2>{t('s2_title')}</h2>
      <p>{t('s2_p1')}</p>

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
      <p>{t('s4_p2')}</p>

      <h2>{t('s5_title')}</h2>
      <p>{t('s5_p1')}</p>
      <p>{t('s5_p2')}</p>

      <h2>{t('s6_title')}</h2>
      <p>
        {t('s6_p1')} <a href="/right-of-withdrawal">{t('s6_link')}</a>
        {t('s6_p2')}
      </p>

      <h2>{t('s7_title')}</h2>
      <p>
        {t('s7_p1')} <a href="/returns-policy">{t('s7_link')}</a>
        {t('s7_p2')}
      </p>

      <h2>{t('s8_title')}</h2>
      <p>
        {t('s8_p1')}{' '}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
          {t('s8_link')}
        </a>
        {t('s8_p2')}
      </p>
      <p>
        {t('s8_p3')}{' '}
        <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noreferrer">
          {t('s8_link2')}
        </a>
        {t('s8_p4')}
      </p>

      <h2>{t('s9_title')}</h2>
      <p>{t('s9_p1')}</p>
    </section>
  );
}
