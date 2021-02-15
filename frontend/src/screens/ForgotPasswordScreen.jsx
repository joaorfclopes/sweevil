import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { sendResetPasswordMail } from "../actions/userActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";

export default function ForgotPasswordScreen(props) {
  const dispatch = useDispatch();

  const userForgotPassword = useSelector((state) => state.userForgotPassword);
  const { loading, success, error } = userForgotPassword;

  const [email, setEmail] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    dispatch(sendResetPasswordMail(email));
  };

  return (
    <motion.section
      className="signin"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      {error && <MessageBox variant="error">{error}</MessageBox>}
      {success && (
        <MessageBox variant="success">
          Reset password link sent to your email
        </MessageBox>
      )}
      <form
        className="form forgot-password signin-container"
        onSubmit={submitHandler}
      >
        <h1>Forgot Password</h1>
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
          <label />
          {loading && <LoadingBox />}
          {!success ? (
            <button className="primary" type="submit">
              Request Email
            </button>
          ) : (
            <>
              <button type="submit">Resend Email</button>
            </>
          )}
        </div>
      </form>
    </motion.section>
  );
}
