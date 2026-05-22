import Tooltip from '@mui/material/Tooltip';
import { Link, useLocation } from 'react-router-dom';
import Email from '../assets/svg/email.svg?react';
import Instagram from '../assets/svg/instagram.svg?react';
import Location from '../assets/svg/location.svg?react';
import ShopNow from '../assets/svg/shop-now.svg?react';
import { notyf } from '../utils/notyf';

export default function Footer({ showShopNow = false }) {
  const { pathname } = useLocation();
  const isShop = pathname === '/shop';

  const copied = () => {
    notyf.success({
      icon: false,
      message: 'Email copied to clipboard!',
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
        <h1>Contacts</h1>
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
        <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/cookie-policy">Cookie Policy</Link>
        <Link to="/right-of-withdrawal">Right of Withdrawal</Link>
        <Link to="/returns-policy">Returns &amp; Refunds</Link>
        <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noreferrer">
          Complaints Book
        </a>
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
          Dispute Resolution
        </a>
      </div>
      <div className="brand-notice" style={isShop ? { paddingBottom: '50px' } : undefined}>
        Sweevil® is a registered brand
      </div>
    </footer>
  );
}
