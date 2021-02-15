import React from "react";
import { Notyf } from "notyf";
import Tooltip from "@material-ui/core/Tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ReactComponent as Email } from "../assets/svg/email.svg";
import { ReactComponent as Instagram } from "../assets/svg/instagram.svg";
import { ReactComponent as Location } from "../assets/svg/location.svg";

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
    <footer className="footer">
      <div className="contacts">
        <div className="line"></div>
        <div className="logos-container">
          <a
            href={process.env.REACT_APP_INSTAGRAM_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <Tooltip title="Instagram">
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
    </footer>
  );
}
