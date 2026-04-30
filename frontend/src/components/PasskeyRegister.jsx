import React, { useState } from "react";
import { useSelector } from "react-redux";
import { startRegistration } from "@simplewebauthn/browser";
import Axios from "axios";
import MessageBox from "./MessageBox";

export default function PasskeyRegister() {
  const { userInfo } = useSelector((s) => s.userSignin);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setStatus("loading");
    setError("");
    try {
      const { data: options } = await Axios.post(
        "/api/passkey/register-options",
        {},
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      const registration = await startRegistration({ optionsJSON: options });
      await Axios.post("/api/passkey/register-verify", registration, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.response?.data?.message || err.message || "Registration failed");
    }
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      {status === "success" && (
        <MessageBox variant="success">Passkey registered successfully.</MessageBox>
      )}
      {status === "error" && (
        <MessageBox variant="error">{error}</MessageBox>
      )}
      <button
        className="secondary"
        onClick={handleRegister}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Registering…" : "Register passkey"}
      </button>
    </div>
  );
}
