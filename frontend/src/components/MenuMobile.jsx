import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { useFeatures } from '../FeaturesContext';
import { enableScroll } from '../scroll';
import { mainOptions, scrollTop, scrollWithOffset } from '../utils';

export default function MenuMobile({ activeSection }) {
  const { t } = useTranslation();
  const { bookingEnabled } = useFeatures();
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const location = useLocation();

  const closeMenu = () => {
    document
      .querySelector('meta[name="viewport"]')
      .setAttribute('content', 'width=device-width, initial-scale=1');
    document.querySelector('.nav-mobile')?.classList.remove('show');
    enableScroll();
  };

  const homeClick = () => {
    closeMenu();
    scrollTop();
  };

  return (
    <div className="nav-mobile">
      <div className="close" onClick={closeMenu}>
        x
      </div>
      <ul>
        {userInfo && (
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={closeMenu}
            >
              {t('nav.admin')}
            </NavLink>
          </li>
        )}
        {mainOptions.map((option) => {
          const isHome = option === 'home';
          const isActive = location.pathname === '/' && activeSection === option;
          return (
            <li key={option}>
              <HashLink
                scroll={(el) => scrollWithOffset(el)}
                to={isHome ? '/' : `/#${option}`}
                className={isActive ? 'active' : ''}
                onClick={isHome ? homeClick : closeMenu}
              >
                {t(`nav.${option}`)}
              </HashLink>
            </li>
          );
        })}
        <li>
          <NavLink
            to="/shop"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            {t('nav.shop')}
          </NavLink>
        </li>
        {bookingEnabled && (
          <li>
            <NavLink
              to="/booking"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={closeMenu}
            >
              {t('nav.booking')}
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
}
