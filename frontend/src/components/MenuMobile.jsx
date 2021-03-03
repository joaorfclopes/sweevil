import React from "react";
import $ from "jquery";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { NavHashLink } from "react-router-hash-link";
import { mainOptions, scrollTop, scrollWithOffset } from "../utils";
import { enableScroll } from "../scroll";

export default function MenuMobile() {
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const closeMenu = () => {
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
            <NavLink to="/admin" activeClassName="active" onClick={closeMenu}>
              admin
            </NavLink>
          </li>
        )}
        {mainOptions.map((option) => (
          <li key={option}>
            <NavHashLink
              scroll={(el) => scrollWithOffset(el)}
              to={`/${option === "home" ? "" : `#${option}`}`}
              activeClassName="active"
              exact={option === "home"}
              onClick={option === "home" ? homeClick : closeMenu}
            >
              {option}
            </NavHashLink>
          </li>
        ))}
        <li>
          <NavLink to="/shop" activeClassName="active" onClick={closeMenu}>
            shop
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
