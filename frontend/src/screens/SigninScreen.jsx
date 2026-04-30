import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { startAuthentication } from "@simplewebauthn/browser";
import Axios from "axios";
import { USER_SIGNIN_SUCCESS } from "../constants/userConstants";
import MessageBox from "../components/MessageBox";

export default function SigninScreen(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const redirect = location.search
    ? location.search.split("=")[1]
    : "/admin";

  const handlePasskeySignin = async () => {
    setPasskeyLoading(true);
    setPasskeyError("");
    try {
      const { data: options } = await Axios.post("/api/passkey/auth-options");
      const authResponse = await startAuthentication({ optionsJSON: options });
      const { data: info } = await Axios.post("/api/passkey/auth-verify", authResponse);
      dispatch({ type: USER_SIGNIN_SUCCESS, payload: info });
      localStorage.setItem("userInfo", JSON.stringify(info));
    } catch (err) {
      setPasskeyError(err.response?.data?.message || "Passkey sign-in failed.");
    } finally {
      setPasskeyLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  return (
    <motion.section
      className="signin"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <div className="row center signin-container">
        <div className="signin-inner">
          <h1>Sign In</h1>

          {passkeyError && <MessageBox variant="error">{passkeyError}</MessageBox>}
          <button
            className="primary"
            style={{ width: "100%", marginBottom: "1.5rem" }}
            onClick={handlePasskeySignin}
            disabled={passkeyLoading}
          >
            {passkeyLoading ? "Waiting for passkey…" : "Sign in with passkey"}
          </button>

        </div>
      </div>
    </motion.section>
  );
}
