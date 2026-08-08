import { Router } from "express";
import multer from "multer";
import { pool, BANNER_SLOTS } from "../db.js";
import { requireAdmin } from "../auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Envie um arquivo de imagem."));
    }
    cb(null, true);
  },
});

const VALID_SLOTS = new Set(BANNER_SLOTS);

const router = Router();

function checkSlot(req, res, next) {
  const slot = Number(req.params.slot);
  if (!VALID_SLOTS.has(slot)) {
    return res.status(404).json({ error: "Slot de banner inválido." });
  }
  req.slot = slot;
  next();
}

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT slot, updated_at FROM banners WHERE image_data IS NOT NULL"
  );
  const bySlot = new Map(rows.map((r) => [r.slot, r]));
  res.json(
    BANNER_SLOTS.map((slot) => ({
      slot,
      hasImage: bySlot.has(slot),
      updatedAt: bySlot.has(slot) ? Number(bySlot.get(slot).updated_at) : null,
    }))
  );
});

router.get("/:slot/file", checkSlot, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT mime_type, image_data FROM banners WHERE slot = $1",
    [req.slot]
  );
  if (rows.length === 0 || !rows[0].image_data) {
    return res.status(404).end();
  }
  res.setHeader("Content-Type", rows[0].mime_type || "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.send(rows[0].image_data);
});

router.put("/:slot", checkSlot, requireAdmin, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Envie uma imagem." });
  }
  const updatedAt = Date.now();
  await pool.query(
    `INSERT INTO banners (slot, mime_type, image_data, updated_at) VALUES ($1,$2,$3,$4)
     ON CONFLICT (slot) DO UPDATE SET mime_type = $2, image_data = $3, updated_at = $4`,
    [req.slot, req.file.mimetype, req.file.buffer, updatedAt]
  );
  res.json({ slot: req.slot, hasImage: true, updatedAt });
});

router.delete("/:slot", checkSlot, requireAdmin, async (req, res) => {
  await pool.query(
    "UPDATE banners SET mime_type = NULL, image_data = NULL, updated_at = $2 WHERE slot = $1",
    [req.slot, Date.now()]
  );
  res.status(204).end();
});

export default router;
