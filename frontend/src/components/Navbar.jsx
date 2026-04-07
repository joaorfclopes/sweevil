import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useSelector } from "react-redux";
import $ from "jquery";
import Logo from "../assets/svg/logo.svg?react";
import Cart from "../assets/svg/cart.svg?react";
import Menu from "../assets/svg/menu.svg?react";
import { mainOptions, scrollTop, scrollWithOffset } from "../utils";
import { disableScroll } from "../scroll";

export default function Navbar(props) {
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const [counter, setCounter] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  const openMenu = () => {
    $(".nav-mobile").addClass("show");
    disableScroll();
  };

  const logoClick = () => {
    setCounter(counter + 1);
    scrollTop();
  };

  useEffect(() => {
    if (!userInfo) {
      $(document).mouseup(function (e) {
        var container = $(".brand-logo");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
          setCounter(0);
          setIsAdmin(false);
        }
      });
      if (counter === 10) {
        setIsAdmin(true);
      }
    }
  }, [userInfo, counter]);

  return (
    <header className={`row ${props.scrolled && "scrolled"}`}>
      <div className="icon-mobile">
        <NavLink to="/cart" className={({ isActive }) => isActive ? "active" : ""}>
          <Cart className="icon fill" />
          <span className="badge">{cartItems.length}</span>
        </NavLink>
      </div>
      <div>
        <NavLink end className="brand" to={!isAdmin ? "/" : "/signin"}>
          <Logo
            className={`brand-logo ${props.scrolled && "scrolled"}`}
            onClick={logoClick}
          />
        </NavLink>
      </div>
      <div>
        <ul className="nav-desktop">
          {userInfo && (
            <li>
              <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>
                admin
              </NavLink>
            </li>
          )}
          {mainOptions.map((option) => {
            const isHome = option === "home";
            const isActive =
              location.pathname === "/" &&
              (isHome ? !location.hash || location.hash === "#" : location.hash === `#${option}`);
            return (
              <li key={option}>
                <HashLink
                  scroll={(el) => scrollWithOffset(el)}
                  to={isHome ? "/" : `/#${option}`}
                  className={isActive ? "active" : ""}
                  onClick={() => isHome && scrollTop()}
                >
                  {option}
                </HashLink>
              </li>
            );
          })}
          <li>
            <NavLink to="/shop" className={({ isActive }) => isActive ? "active" : ""}>
              shop
            </NavLink>
          </li>
          <li>
            <NavLink to="/cart" className={({ isActive }) => isActive ? "active" : ""}>
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
  );
}
