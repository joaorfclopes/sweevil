import React from "react";
import { Link } from "react-router-dom";
import { Notyf } from "notyf";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Tooltip from "@mui/material/Tooltip";
import ShopNow from "../assets/svg/shop-now.svg?react";
import Instagram from "../assets/svg/instagram.svg?react";
import Email from "../assets/svg/email.svg?react";
import Location from "../assets/svg/location.svg?react";

export default function Footer({ showShopNow = false }) {
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
      {showShopNow && (
        <>
          <div className="shop-now">
            <Link to="/shop">
              <ShopNow />
            </Link>
          </div>
          <div className="line"></div>
        </>
      )}
      <div className="footer-content">
        <h1>Contacts</h1>
        <div className="contacts">
          <a
            href={import.meta.env.VITE_INSTAGRAM_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <Tooltip title="Instagram" placement="bottom">
              <span><Instagram /></span>
            </Tooltip>
          </a>
          <CopyToClipboard
            text={import.meta.env.VITE_SENDER_EMAIL_ADDRESS}
            onCopy={copied}
          >
            <Tooltip title="Email" placement="bottom">
              <span><Email /></span>
            </Tooltip>
          </CopyToClipboard>
          <a
            href={import.meta.env.VITE_LOCATION_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <Tooltip title="Location" placement="bottom">
              <span><Location /></span>
            </Tooltip>
          </a>
        </div>
      </div>
      <div className="legal-links">
        <a href="/termos-e-condicoes">Termos e Condições</a>
        <a href="/politica-de-privacidade">Política de Privacidade</a>
        <a href="/politica-de-cookies">Política de Cookies</a>
        <a href="/direito-de-arrependimento">Direito de Arrependimento</a>
        <a href="/politica-de-devolucoes">Devoluções e Reembolsos</a>
        <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noreferrer">Livro de Reclamações</a>
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">Resolução de Litígios</a>
      </div>
    </footer>
  );
}
