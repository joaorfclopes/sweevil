import React from "react";
import $ from "jquery";
import { NavLink } from "react-router-dom";
import { options } from "../utils";
import { useSelector } from "react-redux";

export default function MenuMobile() {
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const closeMenu = () => {
    $(".nav-mobile").removeClass("show");
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
        {options.map((option) => (
          <li onClick={closeMenu} key={option}>
            <NavLink
              to={`/${option === "home" ? "" : option}`}
              activeClassName="active"
              exact={option === "home"}
            >
              {option}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
