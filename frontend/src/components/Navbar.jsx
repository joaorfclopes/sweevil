import React from "react";
import { Link } from "react-router-dom";
import $ from "jquery";
import logo from "../assets/images/brand/logo_white_yellow.PNG";

export default function Navbar() {
  const options = ["home", "about", "gallery", "contacts", "shop"];

  const openMenu = () => {
    $(".nav-mobile li").first().addClass("hide");
    $(".nav-mobile li").not(":first").addClass("show");
    $(".nav-mobile").addClass("full-screen");
  };

  const closeMenu = () => {
    $(".nav-mobile li").first().removeClass("hide");
    $(".nav-mobile li").not(":first").removeClass("show");
    $(".nav-mobile").removeClass("full-screen");
  };

  return (
    <header className="navbar">
      <div>
        <Link to="/">
          <img className="logo" src={logo} alt="logo" />
        </Link>
        <ul className="nav-desktop">
          {options.map((option) => (
            <li key={option}>
              <Link to={option === "home" ? "" : option}>{option}</Link>
            </li>
          ))}
        </ul>
        <ul className="nav-mobile">
          <li onClick={openMenu}>Menu</li>
          <li className="close" onClick={closeMenu}>
            x
          </li>
          {options.map((option) => (
            <li onClick={closeMenu} key={option}>
              <Link to={option === "home" ? "" : option}>{option}</Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
