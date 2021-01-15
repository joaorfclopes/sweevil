import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { resetPassword } from "../actions/userActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";

export default function ResetPasswordScreen(props) {
  const dispatch = useDispatch();

  const userId = props.match.params.id;

  const userResetPassword = useSelector((state) => state.userResetPassword);
  const { loading, success, error } = userResetPassword;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disableTyping, setDisableTyping] = useState(false);

  useEffect(() => {
    if (success) {
      setDisableTyping(true);
    }
  }, [success]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      const passwordError = document.getElementById("passwordError");
      passwordError.style.display = "block";
    } else {
      const passwordError = document.getElementById("passwordError");
      passwordError.style.display = "none";
      dispatch(resetPassword({ password }, userId));
    }
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
      <h1>Reset Password</h1>
      {loading && <LoadingBox lineHeight="70vh" width="100px" />}
      {error && <MessageBox variant="error">{error}</MessageBox>}
      {success && (
        <MessageBox variant="success">
          Password changed. You will be redirected, please wait...
        </MessageBox>
      )}
      <div id="passwordError" style={{ display: "none" }}>
        <MessageBox variant="error">Passwords don't match</MessageBox>
      </div>
      <form className="form" onSubmit={submitHandler}>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            minLength="5"
            placeholder="Enter password"
            required
            onChange={(e) => setPassword(e.target.value)}
            disabled={disableTyping}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm password"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={disableTyping}
          />
        </div>
        <div>
          <label />
          <button className="primary" type="submit">
            Reset Password
          </button>
        </div>
      </form>
    </motion.section>
  );
}
