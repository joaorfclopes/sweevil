import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import $ from "jquery";
import { ReactComponent as Logo } from "../assets/svg/logo.svg";
import { ReactComponent as Cart } from "../assets/svg/cart.svg";
import { ReactComponent as Menu } from "../assets/svg/menu.svg";
import { options } from "../utils";

export default function Navbar() {
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const [counter, setCounter] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const openMenu = () => {
    $(".nav-mobile").addClass("show");
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
    <header className="row">
      <div className="icon-mobile">
        <NavLink to="/cart" activeClassName="active">
          <Cart className="icon fill" />
          <span className="badge">{cartItems.length}</span>
        </NavLink>
      </div>
      <div>
        <NavLink exact className="brand" to={!isAdmin ? "/" : "/signin"}>
          <Logo
            className="brand-logo"
            onClick={() => setCounter(counter + 1)}
          />
        </NavLink>
      </div>
      <div>
        <ul className="nav-desktop">
          {userInfo && (
            <li>
              <NavLink to="/admin" activeClassName="active">
                admin
              </NavLink>
            </li>
          )}
          {options.map((option) => (
            <li key={option}>
              <NavLink to={`/${option}`} activeClassName="active">
                {option}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/cart" activeClassName="active">
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
