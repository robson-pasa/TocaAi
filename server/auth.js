import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function secret() {
  return process.env.SESSION_SECRET || "dev-secret";
}

export function checkAdminLogin(user, pass) {
  const okUser = user === (process.env.ADMIN_USER || "admin");
  const okPass = pass === (process.env.ADMIN_PASS || "troque-por-uma-senha-forte");
  return okUser && okPass;
}

export function signToken(payload) {
  return jwt.sign(payload, secret(), { expiresIn: "7d" });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  try {
    req.user = jwt.verify(token, secret());
    next();
  } catch {
    return res.status(401).json({ error: "Não autorizado" });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Acesso restrito ao administrador" });
    }
    next();
  });
}

export function requireAdminOrOwnBand(req, res, next) {
  requireAuth(req, res, () => {
    const bandId = Number(req.params.id);
    if (req.user.role === "admin") return next();
    if (req.user.role === "band" && req.user.id === bandId) return next();
    return res.status(403).json({ error: "Acesso negado" });
  });
}

const PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generatePassword(length = 10) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARS[crypto.randomInt(PASSWORD_CHARS.length)];
  }
  return out;
}

export function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "grupo";
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
