import React, { useState } from "react";
import Axios from "axios";
import { authClient } from "../lib/authClient";
import MessageBox from "./MessageBox";

export default function PasskeyRegister() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const { data: session } = authClient.useSession();
  const { data: passkeys, isPending } = authClient.useListPasskeys();

  const handleRegister = async () => {
    setStatus("loading");
    setError("");
    try {
      const name = session?.user?.email || navigator.userAgent;
      const result = await authClient.passkey.addPasskey({ name });
      if (result?.error) {
        await Axios.delete("/api/users/passkey-challenge").catch(() => {});
        setStatus("error");
        setError(result.error.message || "Registration failed");
      }
    } catch (err) {
      await Axios.delete("/api/users/passkey-challenge").catch(() => {});
      setStatus("error");
      setError(err.message || "Registration failed");
    } finally {
      if (status !== "error") setStatus("idle");
    }
  };

  if (isPending) return null;

  const hasPasskey = passkeys && passkeys.length > 0;

  return (
    <div style={{ marginBottom: "1rem" }}>
      {status === "error" && (
        <MessageBox variant="error">{error}</MessageBox>
      )}
      {hasPasskey ? (
        <div
          style={{
            display: "inline-block",
            border: "2px solid #4caf50",
            color: "#4caf50",
            padding: "0.5rem 1rem",
            cursor: "default",
          }}
        >
          Passkey Active
        </div>
      ) : (
        <button
          className="secondary"
          onClick={handleRegister}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Registering…" : "Register passkey"}
        </button>
      )}
    </div>
  );
}
