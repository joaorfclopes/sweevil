import React from "react";
import { Link } from "react-router-dom";

export default function AdminScreen() {
  return (
    <section>
      <form className="form admin">
        <div>
          <h1>Admin</h1>
        </div>
        <div>
          <label htmlFor="email">Email address</label>
          <input type="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" required />
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
    </section>
  );
}
