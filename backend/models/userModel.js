import mongoose from "mongoose";

const passkeySchema = new mongoose.Schema({
  credentialID: { type: String, required: true },
  credentialPublicKey: { type: String, required: true },
  counter: { type: Number, required: true },
  transports: [{ type: String }],
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: Number, required: true },
    password: { type: String },
    isAdmin: { type: Boolean, required: true, default: false },
    passkeys: { type: [passkeySchema], default: [] },
    currentChallenge: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
