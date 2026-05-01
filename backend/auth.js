import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { passkey } from "@better-auth/passkey";
import { admin } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import mongoose from "mongoose";

const getRpConfig = () => {
  const rpID = process.env.APP_DOMAIN || "localhost";
  const origin =
    process.env.NODE_ENV === "production"
      ? `https://${rpID}`
      : process.env.FRONTEND_URL || "http://localhost:3000";
  return { rpID, rpName: process.env.BRAND_NAME || "App", origin };
};

let _auth = null;

export const getAuth = () => {
  if (!_auth) {
    const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    _auth = betterAuth({
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
      trustedOrigins: [
        process.env.BETTER_AUTH_URL || "http://localhost:5000",
        process.env.FRONTEND_URL || "http://localhost:3000",
      ],
      database: mongodbAdapter(mongoose.connection.getClient().db()),
      emailAndPassword: { enabled: false },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      },
      plugins: [
        passkey(getRpConfig()),
        admin({ defaultRole: "admin" }),
      ],
      databaseHooks: {
        user: {
          create: {
            before: async (user) => {
              if (!ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
                throw new APIError("FORBIDDEN", {
                  message: "Registration not allowed for this email",
                });
              }
            },
          },
        },
        account: {
          create: {
            before: async (account) => ({
              data: { ...account, accessToken: null, refreshToken: null, idToken: null, accessTokenExpiresAt: null },
            }),
          },
          update: {
            before: async (account) => ({
              data: { ...account, accessToken: null, refreshToken: null, idToken: null, accessTokenExpiresAt: null },
            }),
          },
        },
      },
      session: {
        expiresIn: 60 * 60 * 8,
        updateAge: 60 * 60,
      },
    });
  }
  return _auth;
};
