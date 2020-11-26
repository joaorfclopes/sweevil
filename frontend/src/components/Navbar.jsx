import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import $ from "jquery";
import logo from "../assets/images/brand/logo_white_yellow.PNG";
import { ReactComponent as Cart } from "../assets/images/svg/cart.svg";
import { ReactComponent as Menu } from "../assets/images/svg/menu.svg";
import { options } from "../utils";

export default function Navbar() {
  const [counter, setCounter] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const openMenu = () => {
    $(".nav-mobile").addClass("show");
  };

  useEffect(() => {
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
  }, [counter]);

  return (
    <header className="row">
      <div className="icon-mobile">
        <NavLink exact to="/cart" activeClassName="active">
          <Cart className="icon" />
          <span className="badge">0</span>
        </NavLink>
      </div>
      <div>
        <NavLink exact className="brand" to={!isAdmin ? "/" : "/admin"}>
          <img
            onClick={() => setCounter(counter + 1)}
            className="brand-logo"
            src={logo}
            alt="logo"
          />
        </NavLink>
      </div>
      <div>
        <ul className="nav-desktop">
          {options.map((option) => (
            <li key={option}>
              <NavLink
                exact
                to={option !== "home" ? option : "/"}
                activeClassName="active"
              >
                {option}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink exact to="/cart" activeClassName="active">
              <Cart className="icon" />
              <span className="badge">0</span>
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
