import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { startAuthentication } from "@simplewebauthn/browser";
import Axios from "axios";
import { signin } from "../actions/userActions";
import { USER_SIGNIN_SUCCESS } from "../constants/userConstants";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";

export default function SigninScreen(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");

  const userSignin = useSelector((state) => state.userSignin);
  const { loading, userInfo, error } = userSignin;

  const redirect = location.search
    ? location.search.split("=")[1]
    : "/admin";

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(signin(email, password));
  };

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

          <form className="form admin" onSubmit={submitHandler}>
            {loading && <LoadingBox />}
            {error && <MessageBox variant="error">{error}</MessageBox>}
            <div>
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <button className="primary" type="submit">
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.section>
  );
}
