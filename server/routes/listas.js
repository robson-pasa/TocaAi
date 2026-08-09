import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../auth.js";

const router = Router();

router.get("/cidades", async (req, res) => {
  const { rows } = await pool.query("SELECT id, nome FROM cidades ORDER BY nome");
  res.json(rows);
});

router.post("/cidades", requireAdmin, async (req, res) => {
  const nome = String(req.body?.nome || "").trim();
  if (!nome) return res.status(400).json({ error: "Informe um nome." });
  try {
    const { rows } = await pool.query(
      "INSERT INTO cidades (nome) VALUES ($1) RETURNING id, nome",
      [nome]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Essa cidade já existe." });
    throw err;
  }
});

router.delete("/cidades/:id", requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM cidades WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

router.get("/estilos", async (req, res) => {
  const { rows } = await pool.query("SELECT id, nome FROM estilos_musicais ORDER BY nome");
  res.json(rows);
});

router.post("/estilos", requireAdmin, async (req, res) => {
  const nome = String(req.body?.nome || "").trim();
  if (!nome) return res.status(400).json({ error: "Informe um nome." });
  try {
    const { rows } = await pool.query(
      "INSERT INTO estilos_musicais (nome) VALUES ($1) RETURNING id, nome",
      [nome]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Esse estilo já existe." });
    throw err;
  }
});

router.delete("/estilos/:id", requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM estilos_musicais WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

export default router;
