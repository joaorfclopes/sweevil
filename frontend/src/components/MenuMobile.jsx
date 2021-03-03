import React from "react";
import $ from "jquery";
import { NavLink } from "react-router-dom";
import { NavHashLink } from "react-router-hash-link";
import { mainOptions, scrollTop, scrollWithOffset } from "../utils";
import { useSelector } from "react-redux";

export default function MenuMobile() {
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const closeMenu = () => {
    $(".nav-mobile").removeClass("show");
    $("body").css("overflowY", "auto");
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
