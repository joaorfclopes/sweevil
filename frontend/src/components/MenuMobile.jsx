import React from "react";
import $ from "jquery";
import { NavLink } from "react-router-dom";
import { options } from "../utils";

export default function MenuMobile() {
  const closeMenu = () => {
    $(".nav-mobile").removeClass("show");
  };

  return (
    <div className="nav-mobile">
      <div className="close" onClick={closeMenu}>
        x
      </div>
      <ul>
        {options.map((option) => (
          <li onClick={closeMenu} key={option}>
            <NavLink
              exact
              to={option !== "home" ? option : "/"}
              activeClassName="active"
            >
              {option}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
