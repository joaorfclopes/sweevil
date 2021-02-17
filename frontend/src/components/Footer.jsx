import React from "react";
import { Link } from "react-router-dom";
import { Notyf } from "notyf";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Tooltip from "@material-ui/core/Tooltip";
import { ReactComponent as Logo } from "../assets/svg/logo.svg";
import { ReactComponent as ShopNow } from "../assets/svg/shop-now.svg";
import { ReactComponent as Instagram } from "../assets/svg/instagram.svg";
import { ReactComponent as Email } from "../assets/svg/email.svg";
import { ReactComponent as Location } from "../assets/svg/location.svg";
import { ReactComponent as DevLogo } from "../assets/svg/dev-logo.svg";

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
      <div className="line"></div>
      <div className="row">
        <div className="footer-content brand">
          <Logo />
          <p>&copy; Sweevil</p>
        </div>
        <div className="footer-content">
          <div className="shop-now">
            <Link to="/shop">
              <ShopNow />
            </Link>
          </div>
        </div>
        <div className="footer-content">
          <h1>Contacts</h1>
          <div className="contacts">
            <a
              href={process.env.REACT_APP_INSTAGRAM_LINK}
              target="_blank"
              rel="noreferrer"
            >
              <Tooltip title="Instagram" placement="bottom">
                <Instagram />
              </Tooltip>
            </a>
            <CopyToClipboard
              text={process.env.REACT_APP_SENDER_EMAIL_ADDRESS}
              onCopy={copied}
            >
              <Tooltip title="Email">
                <Email />
              </Tooltip>
            </CopyToClipboard>
            <a
              href={process.env.REACT_APP_LOCATION_LINK}
              target="_blank"
              rel="noreferrer"
            >
              <Tooltip title="Location">
                <Location />
              </Tooltip>
            </a>
          </div>
        </div>
      </div>
      <p className="joao-lopes">
        developed by{" "}
        <a
          href={process.env.REACT_APP_DEVELOPER_LINK}
          target="_blank"
          rel="noreferrer"
        >
          João Lopes <DevLogo />
        </a>
      </p>
    </footer>
  );
}
