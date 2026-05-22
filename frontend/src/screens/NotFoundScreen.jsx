import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function NotFoundScreen(props) {
  const { t } = useTranslation();
  return (
    <section className="not-found-screen">
      <div className="row center not-found-screen-container">
        <div className="not-found">
          <img src="/404.avif" alt={t('notFound.title')} className="not-found-image" />
          <h1 className="title">{t('notFound.title')}</h1>
          <Link to="/">
            <button className="secondary">{t('notFound.home')}</button>
          </Link>
        </div>
      </div>
    </section>
  );
}
