import { useTranslation } from 'react-i18next';

export default function DireitoArrependimentoScreen() {
  const { t } = useTranslation('withdrawal');
  return (
    <section className="legal-screen custom-font">
      <h1>{t('title')}</h1>
      <span className="last-updated">{t('lastUpdated')}</span>

      <h2>{t('s1_title')}</h2>
      <p>{t('s1_p1')}</p>

      <h2>{t('s2_title')}</h2>
      <p>{t('s2_p1')}</p>
      <ul>
        <li>
          {t('s2_li1_email_label')}{' '}
          <a href="mailto:silvia.seixas.peralta@gmail.com">{t('s2_li1_email')}</a>
        </li>
        <li>{t('s2_li2')}</li>
        <li>{t('s2_li3')}</li>
      </ul>

      <h2>{t('s3_title')}</h2>
      <p>{t('s3_p1')}</p>
      <p>
        <em>{t('s3_form')}</em>
      </p>
      <p>{t('s3_p2')}</p>

      <h2>{t('s4_title')}</h2>
      <p>{t('s4_p1')}</p>

      <h2>{t('s5_title')}</h2>
      <p>{t('s5_p1')}</p>
      <p>{t('s5_p2')}</p>

      <h2>{t('s6_title')}</h2>
      <p>{t('s6_p1')}</p>
    </section>
  );
}
