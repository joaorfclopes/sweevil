import React from "react";
import { Link } from "react-router-dom";
import { Notyf } from "notyf";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Tooltip from "@mui/material/Tooltip";
import ShopNow from "../assets/svg/shop-now.svg?react";
import Instagram from "../assets/svg/instagram.svg?react";
import Email from "../assets/svg/email.svg?react";
import Location from "../assets/svg/location.svg?react";
import DevLogo from "../assets/svg/dev-logo.svg?react";

export default function Footer() {
  const notyf = new Notyf();

  const copied = () => {
    notyf.success({
      icon: false,
      message: "Email copied to clipboard!",
      dismissible: true,
    });
  };

  return (
    <footer className="footer custom-font">
      <div className="shop-now">
        <Link to="/shop">
          <ShopNow />
        </Link>
      </div>
      <div className="line"></div>
      <div className="footer-content">
        <h1>Contacts</h1>
        <div className="contacts">
          <a
            href={import.meta.env.VITE_INSTAGRAM_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <Tooltip title="Instagram" placement="bottom">
              <Instagram />
            </Tooltip>
          </a>
          <CopyToClipboard
            text={import.meta.env.VITE_SENDER_EMAIL_ADDRESS}
            onCopy={copied}
          >
            <Tooltip title="Email" placement="bottom">
              <Email />
            </Tooltip>
          </CopyToClipboard>
          <a
            href={import.meta.env.VITE_LOCATION_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <Tooltip title="Location" placement="bottom">
              <Location />
            </Tooltip>
          </a>
        </div>
      </div>
      <p className="joao-lopes">
        developed by{" "}
        <a
          href={import.meta.env.VITE_DEVELOPER_LINK}
          target="_blank"
          rel="noreferrer"
        >
          João Lopes <DevLogo />
        </a>
      </p>
    </footer>
  );
}
