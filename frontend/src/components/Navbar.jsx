import React, { useEffect, useMemo } from "react";
import $ from "jquery";
import logo from "../assets/images/brand/logo_white_yellow.PNG";

export default function Navbar() {
  const options = useMemo(
    () => ["home", "about", "gallery", "contacts", "shop"],
    []
  );

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

  useEffect(() => {
    options.forEach((option) => {
      if (window.location.href.indexOf(`/${option}`) > -1) {
        $(`.${option}`).addClass("active");
      }
    });
  }, [options]);

  return (
    <header className="navbar">
      <div>
        <a href="./index.html">
          <img className="logo" src={logo} alt="logo" />
        </a>
        <ul className="nav-desktop">
          {options.map((option) => (
            <li key={option}>
              <a className={option} href={option}>
                {option}
              </a>
            </li>
          ))}
        </ul>
        <ul className="nav-mobile">
          <li onClick={openMenu}>Menu</li>
          <li className="close" onClick={closeMenu}>
            x
          </li>
          {options.map((option) => (
            <li key={option}>
              <a className={option} href={option}>
                {option}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
