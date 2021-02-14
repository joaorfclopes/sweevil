import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { signin } from "../actions/userActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { scrollTop } from "../utils.js";

export default function SigninScreen(props) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const userSignin = useSelector((state) => state.userSignin);
  const { loading, userInfo, error } = userSignin;

  const redirect = props.location.search
    ? props.location.search.split("=")[1]
    : "/admin";

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(signin(email, password));
  };

  useEffect(() => {
    scrollTop();
    if (userInfo) {
      props.history.push(redirect);
    }
  }, [userInfo, props, redirect]);

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
              <label>
                <Link to="/forgotPassword">Forgot Password</Link>
              </label>
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
