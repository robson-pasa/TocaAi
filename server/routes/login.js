import { Router } from "express";
import { pool } from "../db.js";
import { checkAdminLogin, signToken, comparePassword } from "../auth.js";

const router = Router();

router.post("/", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Informe usuário e senha." });
  }

  if (checkAdminLogin(username, password)) {
    return res.json({ token: signToken({ role: "admin" }), role: "admin" });
  }

  const { rows } = await pool.query(
    `SELECT id, password_hash FROM bands WHERE lower(username) = lower($1) AND status = 'aprovado'`,
    [username]
  );
  const band = rows[0];
  if (!band || !band.password_hash) {
    return res.status(401).json({ error: "Usuário ou senha inválidos." });
  }

  const ok = await comparePassword(password, band.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Usuário ou senha inválidos." });
  }

  return res.json({
    token: signToken({ role: "band", id: band.id }),
    role: "band",
    bandId: band.id,
  });
});

export default router;
