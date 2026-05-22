import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import Cart from '../assets/svg/cart.svg?react';
import Logo from '../assets/svg/logo.svg?react';
import Menu from '../assets/svg/menu.svg?react';
import { useFeatures } from '../FeaturesContext';
import i18n from '../i18n';
import { disableScroll, enableScroll } from '../scroll';
import { mainOptions, scrollTop, scrollWithOffset } from '../utils';

export default function Navbar({ scrolled, activeSection }) {
  const { t } = useTranslation();
  const currentLang = i18n.language;
  const toggleLang = () => {
    const next = currentLang === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };
  const { bookingEnabled } = useFeatures();
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const [counter, setCounter] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const openMenu = () => {
    document
      .querySelector('meta[name="viewport"]')
      .setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
    setMenuOpen(true);
    disableScroll();
  };

  const closeMenu = () => {
    document
      .querySelector('meta[name="viewport"]')
      .setAttribute('content', 'width=device-width, initial-scale=1');
    setMenuOpen(false);
    enableScroll();
  };

  const logoClick = () => {
    setCounter(counter + 1);
    scrollTop();
  };

  const homeClick = () => {
    closeMenu();
    scrollTop();
  };

  useEffect(() => {
    if (!userInfo) {
      const handler = (e) => {
        const container = document.querySelector('.brand-logo');
        if (container && !container.contains(e.target)) {
          setCounter(0);
          setIsAdmin(false);
        }
      };
      document.addEventListener('mouseup', handler);
      if (counter === 10) {
        setIsAdmin(true);
      }
      return () => document.removeEventListener('mouseup', handler);
    }
  }, [userInfo, counter]);

  return (
    <>
      <header className={`row ${scrolled && 'scrolled'}`}>
        <div className="icon-mobile">
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Cart className="icon fill" />
            <span className="badge">{cartItems.length}</span>
          </NavLink>
        </div>
        <div>
          <NavLink end className="brand" to={!isAdmin ? '/' : '/signin'}>
            <Logo className="brand-logo" onClick={logoClick} />
          </NavLink>
        </div>
        <div>
          <ul className="nav-desktop">
            {userInfo && (
              <li>
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
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
                    onClick={() => isHome && scrollTop()}
                  >
                    {t(`nav.${option}`)}
                  </HashLink>
                </li>
              );
            })}
            <li>
              <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : '')}>
                {t('nav.shop')}
              </NavLink>
            </li>
            {bookingEnabled && (
              <li>
                <NavLink to="/booking" className={({ isActive }) => (isActive ? 'active' : '')}>
                  {t('nav.booking')}
                </NavLink>
              </li>
            )}
            <li>
              <button
                className="lang-toggle"
                onClick={toggleLang}
                title={currentLang === 'pt' ? t('nav.switchToEn') : t('nav.switchToPt')}
                style={{
                  background: 'none',
                  border: '1px solid currentColor',
                  borderRadius: '4px',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  padding: '2px 6px',
                }}
              >
                {currentLang === 'pt' ? 'EN' : 'PT'}
              </button>
            </li>
            <li>
              <NavLink to="/cart" className={({ isActive }) => (isActive ? 'active' : '')}>
                <Cart className="icon" />
                <span className="badge">{cartItems.length}</span>
              </NavLink>
            </li>
          </ul>
          <div onClick={openMenu} className="icon-mobile">
            <Menu className="icon" />
          </div>
        </div>
      </header>

      <div className={`nav-mobile ${menuOpen ? 'show' : ''}`}>
        <div className="close" onClick={closeMenu}>
          →
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
          <li>
            <button
              className="lang-toggle"
              onClick={() => {
                toggleLang();
                closeMenu();
              }}
              title={currentLang === 'pt' ? t('nav.switchToEn') : t('nav.switchToPt')}
              style={{
                background: 'none',
                border: '1px solid currentColor',
                borderRadius: '4px',
                color: 'inherit',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                padding: '2px 6px',
              }}
            >
              {currentLang === 'pt' ? 'EN' : 'PT'}
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
