import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signout } from '../actions/userActions';
import PasskeyRegister from '../components/PasskeyRegister';
import { useFeatures } from '../FeaturesContext';
import { scrollTop } from '../utils.js';

import AboutAdminTab from '../components/AboutAdminTab';
import AnalyticsAdminTab from '../components/AnalyticsAdminTab';
import BookingsAdminTab from '../components/BookingsAdminTab';
import GalleryAdminTab from '../components/GalleryAdminTab';
import OrdersTable from '../components/OrdersTable';
import ProductsTable from '../components/ProductsTable';

export default function AdminScreen() {
  const { t } = useTranslation();
  const { bookingEnabled } = useFeatures();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signoutHandler = () => {
    navigate('/');
    dispatch(signout());
  };

  useEffect(() => {
    scrollTop();
  }, []);

  const sections = [
    { id: 'section-analytics', label: t('admin.analytics') },
    ...(bookingEnabled ? [{ id: 'section-bookings', label: t('admin.bookings') }] : []),
    { id: 'section-orders', label: t('admin.orders') },
    { id: 'section-products', label: t('admin.products') },
    { id: 'section-gallery', label: t('admin.gallery') },
    { id: 'section-about', label: t('admin.about') },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navHeight = 130;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <section className="admin-screen">
      <nav className="admin-section-nav">
        <div className="admin-section-nav__pills">
          {sections.map(({ id, label }) => (
            <button key={id} className="admin-section-nav__item" onClick={() => scrollTo(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="admin-section-nav__actions">
          <PasskeyRegister />
          <button
            className="secondary admin-logout-btn"
            onClick={signoutHandler}
            title={t('common.logout')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </nav>

      <div id="section-analytics">
        <AnalyticsAdminTab />
      </div>
      <div id="section-bookings">{bookingEnabled && <BookingsAdminTab />}</div>
      <div id="section-orders">
        <OrdersTable />
      </div>
      <div id="section-products">
        <ProductsTable />
      </div>
      <div id="section-gallery">
        <GalleryAdminTab />
      </div>
      <div id="section-about">
        <AboutAdminTab />
      </div>
    </section>
  );
}
