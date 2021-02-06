import React from "react";
import { ReactComponent as Location } from "../assets/svg/location.svg";
import { ReactComponent as Email } from "../assets/svg/email.svg";
import { ReactComponent as Instagram } from "../assets/svg/instagram.svg";

export default function ShareButton() {
  return (
    <div className="share-button">
      <div className="btn_wrap">
        <span>Contacts</span>
        <div className="container">
          <a
            href={process.env.REACT_APP_LOCATION_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <Location />
          </a>
          <a
            href={process.env.REACT_APP_EMAIL_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <Email />
          </a>
          <a
            href={process.env.REACT_APP_INSTAGRAM_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <Instagram />
          </a>
        </div>
      </div>
    </div>
  );
}
