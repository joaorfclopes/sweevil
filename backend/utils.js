import { fromNodeHeaders } from "better-auth/node";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { getAuth } from "./auth.js";

const getSession = (req) =>
  getAuth().api.getSession({ headers: fromNodeHeaders(req.headers) });

export const isAuth = async (req, res, next) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).send({ message: "Not authenticated" });
    const db = mongoose.connection.getClient().db();
    const userExists = await db
      .collection("user")
      .findOne({ _id: new ObjectId(session.user.id) }, { projection: { _id: 1 } });
    if (!userExists) return res.status(401).send({ message: "Not authenticated" });
    req.user = {
      _id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      isAdmin: session.user.role === "admin",
    };
    next();
  } catch {
    res.status(401).send({ message: "Not authenticated" });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const session = await getSession(req);
    if (session) {
      req.user = {
        _id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        isAdmin: session.user.role === "admin",
      };
    }
  } catch {
    // not authenticated — continue without user
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user?.isAdmin) return next();
  res.status(403).send({ message: "Admin access denied" });
};

export const formatDate = (date) => {
  const day = date.substring(8, 10);
  const month = date.substring(5, 7);
  const year = date.substring(0, 4);
  return `${day}.${month}.${year}`;
};

export const formatName = (name) => {
  if (/\s/.test(name)) return name.substr(0, name.indexOf(" "));
  return name;
};
