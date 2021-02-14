import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { NavHashLink } from "react-router-hash-link";
import { useSelector } from "react-redux";
import $ from "jquery";
import { ReactComponent as Logo } from "../assets/svg/logo.svg";
import { ReactComponent as Cart } from "../assets/svg/cart.svg";
import { ReactComponent as Menu } from "../assets/svg/menu.svg";
import { mainOptions, scrollTop, scrollWithOffset } from "../utils";

export default function Navbar(props) {
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const [counter, setCounter] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const openMenu = () => {
    $(".nav-mobile").addClass("show");
  };

  const logoClick = () => {
    setCounter(counter + 1);
    scrollTop();
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
    <header className={`row ${props.scrolled && "scrolled"}`}>
      <div className="icon-mobile">
        <NavLink to="/cart" activeClassName="active">
          <Cart className="icon fill" />
          <span className="badge">{cartItems.length}</span>
        </NavLink>
      </div>
      <div>
        <NavLink exact className="brand" to={!isAdmin ? "/" : "/signin"}>
          <Logo
            className={`brand-logo ${props.scrolled && "scrolled"}`}
            onClick={logoClick}
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
          {mainOptions.map((option) => (
            <li key={option}>
              <NavHashLink
                scroll={(el) => scrollWithOffset(el)}
                to={`/${option === "home" ? "" : `#${option}`}`}
                activeClassName="active"
                exact={option === "home"}
                onClick={() => option === "home" && scrollTop()}
              >
                {option}
              </NavHashLink>
            </li>
          ))}
          <li>
            <NavLink to="/shop" activeClassName="active">
              shop
            </NavLink>
          </li>
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
