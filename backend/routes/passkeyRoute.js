import express from "express";
import expressAsyncHandler from "express-async-handler";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import User from "../models/userModel.js";
import { generateToken, isAdmin, isAuth } from "../utils.js";

const passkeyRouter = express.Router();

const getRpConfig = () => {
  const rpID = process.env.APP_DOMAIN || "localhost";
  const origin =
    process.env.NODE_ENV === "production"
      ? `https://${rpID}`
      : "http://localhost:3000";
  return { rpID, rpName: process.env.BRAND_NAME || "App", origin };
};

passkeyRouter.post(
  "/register-options",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { rpID, rpName } = getRpConfig();

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(user._id.toString()),
      userName: user.email,
      userDisplayName: user.name,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "required",
      },
      excludeCredentials: user.passkeys.map((pk) => ({
        id: pk.credentialID,
        type: "public-key",
      })),
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
  })
);

passkeyRouter.post(
  "/register-verify",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { rpID, origin } = getRpConfig();

    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified) {
      return res.status(400).json({ message: "Passkey registration failed" });
    }

    const { credential } = verification.registrationInfo;
    user.passkeys.push({
      credentialID: credential.id,
      credentialPublicKey: Buffer.from(credential.publicKey).toString("base64"),
      counter: credential.counter,
      transports: req.body.response?.transports ?? [],
    });
    user.currentChallenge = null;
    await user.save();

    res.json({ verified: true });
  })
);

passkeyRouter.post(
  "/auth-options",
  expressAsyncHandler(async (req, res) => {
    const { rpID } = getRpConfig();

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "required",
      allowCredentials: [],
    });

    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) return res.status(404).json({ message: "No admin account found" });

    adminUser.currentChallenge = options.challenge;
    await adminUser.save();

    res.json(options);
  })
);

passkeyRouter.post(
  "/auth-verify",
  expressAsyncHandler(async (req, res) => {
    const { rpID, origin } = getRpConfig();
    const { id } = req.body;

    const user = await User.findOne({ "passkeys.credentialID": id });
    if (!user) return res.status(404).json({ message: "Passkey not recognised" });

    const passkey = user.passkeys.find((pk) => pk.credentialID === id);

    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: passkey.credentialID,
        publicKey: Buffer.from(passkey.credentialPublicKey, "base64"),
        counter: passkey.counter,
        transports: passkey.transports,
      },
    });

    if (!verification.verified) {
      return res.status(401).json({ message: "Passkey authentication failed" });
    }

    passkey.counter = verification.authenticationInfo.newCounter;
    user.currentChallenge = null;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);

export default passkeyRouter;
