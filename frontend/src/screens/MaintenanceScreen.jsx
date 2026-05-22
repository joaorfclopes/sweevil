import { useTranslation } from 'react-i18next';

export default function MaintenanceScreen() {
  const { t } = useTranslation();
  return (
    <div className="maintenance-screen">
      <img src="/maintenance.avif" alt={t('maintenance.title')} className="maintenance-image" />
      <h1 className="title">{t('maintenance.title')}</h1>
      <p>{t('maintenance.text')}</p>
    </div>
  );
}
