import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import Email from '../assets/svg/email.svg?react';
import Instagram from '../assets/svg/instagram.svg?react';
import Location from '../assets/svg/location.svg?react';
import ShopNow from '../assets/svg/shop-now.svg?react';
import { notyf } from '../utils/notyf';

export default function Footer({ showShopNow = false }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isShop = pathname === '/shop';

  const copied = () => {
    notyf.success({
      icon: false,
      message: t('footer.emailCopied'),
      dismissible: true,
    });
  };

  return (
    <footer className="footer custom-font">
      {showShopNow && (
        <>
          <div className="shop-now">
            <Link to="/shop">
              <ShopNow />
            </Link>
          </div>
          <div className="line"></div>
        </>
      )}
      <div className="footer-content">
        <h1>{t('footer.contacts')}</h1>
        <div className="contacts">
          <a href={import.meta.env.VITE_INSTAGRAM_LINK} target="_blank" rel="noreferrer">
            <Tooltip title="Instagram" placement="bottom">
              <span>
                <Instagram />
              </span>
            </Tooltip>
          </a>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() =>
              navigator.clipboard.writeText(import.meta.env.VITE_SENDER_EMAIL_ADDRESS).then(copied)
            }
          >
            <Tooltip title="Email" placement="bottom">
              <span>
                <Email />
              </span>
            </Tooltip>
          </span>
          <a href={import.meta.env.VITE_LOCATION_LINK} target="_blank" rel="noreferrer">
            <Tooltip title="Location" placement="bottom">
              <span>
                <Location />
              </span>
            </Tooltip>
          </a>
        </div>
      </div>
      <div className="legal-links">
        <Link to="/terms-and-conditions">{t('footer.termsConditions')}</Link>
        <Link to="/privacy-policy">{t('footer.privacyPolicy')}</Link>
        <Link to="/cookie-policy">{t('footer.cookiePolicy')}</Link>
        <Link to="/right-of-withdrawal">{t('footer.rightWithdrawal')}</Link>
        <Link to="/returns-policy">{t('footer.returnsPolicy')}</Link>
        <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noreferrer">
          {t('footer.complaintsBook')}
        </a>
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
          {t('footer.disputeResolution')}
        </a>
      </div>
      <div className="brand-notice" style={isShop ? { paddingBottom: '50px' } : undefined}>
        {t('footer.brandNotice')}
      </div>
    </footer>
  );
}
