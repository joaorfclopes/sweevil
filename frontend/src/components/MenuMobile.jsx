import React from "react";
import $ from "jquery";
import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { mainOptions, scrollTop, scrollWithOffset } from "../utils";
import { useFeatures } from "../FeaturesContext";
import { enableScroll } from "../scroll";

export default function MenuMobile() {
  const { bookingEnabled } = useFeatures();
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const location = useLocation();

  const closeMenu = () => {
    document
      .querySelector('meta[name="viewport"]')
      .setAttribute("content", "width=device-width, initial-scale=1");
    $(".nav-mobile").removeClass("show");
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
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
            >
              admin
            </NavLink>
          </li>
        )}
        {mainOptions.map((option) => {
          const isHome = option === "home";
          const isActive =
            location.pathname === "/" &&
            (isHome
              ? !location.hash || location.hash === "#"
              : location.hash === `#${option}`);
          return (
            <li key={option}>
              <HashLink
                scroll={(el) => scrollWithOffset(el)}
                to={isHome ? "/" : `/#${option}`}
                className={isActive ? "active" : ""}
                onClick={isHome ? homeClick : closeMenu}
              >
                {option}
              </HashLink>
            </li>
          );
        })}
        <li>
          <NavLink
            to="/shop"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            shop
          </NavLink>
        </li>
        {bookingEnabled && (
          <li>
            <NavLink
              to="/booking"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
            >
              booking
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
}
