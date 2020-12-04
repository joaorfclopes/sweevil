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
              Admin
            </NavLink>
          </li>
        )}
        {options.map((option) => (
          <li onClick={closeMenu} key={option}>
            <NavLink to={`/${option}`} activeClassName="active">
              {option}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
