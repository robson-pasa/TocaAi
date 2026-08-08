import { Router } from "express";
import multer from "multer";
import { pool, PUBLIC_LIST_COLUMNS, PUBLIC_DETAIL_COLUMNS, ADMIN_LIST_COLUMNS, rowToPublicListItem, rowToPublicDetail, rowToAdminItem } from "../db.js";
import { requireAdmin, requireAdminOrOwnBand, generatePassword, slugify, hashPassword } from "../auth.js";

const MAX_FOTO_BYTES = 6 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "foto" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("A foto precisa ser um arquivo de imagem."));
    }
    if (file.fieldname === "mp3" && !file.mimetype.startsWith("audio/")) {
      return cb(new Error("O arquivo de música precisa ser um áudio (mp3)."));
    }
    cb(null, true);
  },
});

const uploadFields = upload.fields([
  { name: "foto", maxCount: 1 },
  { name: "mp3", maxCount: 1 },
]);

function handleUpload(req, res, next) {
  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Falha no upload." });
    }
    const foto = req.files?.foto?.[0];
    if (foto && foto.size > MAX_FOTO_BYTES) {
      return res.status(400).json({ error: "A foto deve ter no máximo 6MB." });
    }
    next();
  });
}

const router = Router();

// ---------- Público ----------

router.get("/filtros", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT cidade FROM bands WHERE status = 'aprovado' ORDER BY cidade`
  );
  const { rows: estilos } = await pool.query(
    `SELECT DISTINCT estilo_musical FROM bands WHERE status = 'aprovado' ORDER BY estilo_musical`
  );
  res.json({
    cidades: rows.map((r) => r.cidade),
    estilos: estilos.map((r) => r.estilo_musical),
  });
});

router.get("/", async (req, res) => {
  const { cidade, estilo } = req.query;
  const conditions = [`status = 'aprovado'`];
  const params = [];
  if (cidade) {
    params.push(cidade);
    conditions.push(`cidade = $${params.length}`);
  }
  if (estilo) {
    params.push(estilo);
    conditions.push(`estilo_musical = $${params.length}`);
  }
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_LIST_COLUMNS} FROM bands WHERE ${conditions.join(" AND ")} ORDER BY nome_grupo`,
    params
  );
  res.json(rows.map(rowToPublicListItem));
});

router.get("/:id/foto", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT foto_mime, foto_data FROM bands WHERE id = $1 AND status = 'aprovado'`,
    [req.params.id]
  );
  if (!rows.length || !rows[0].foto_data) return res.status(404).end();
  res.setHeader("Content-Type", rows[0].foto_mime || "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.send(rows[0].foto_data);
});

router.get("/:id/mp3", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT mp3_mime, mp3_data FROM bands WHERE id = $1 AND status = 'aprovado'`,
    [req.params.id]
  );
  if (!rows.length || !rows[0].mp3_data) return res.status(404).end();

  const data = rows[0].mp3_data;
  const mime = rows[0].mp3_mime || "audio/mpeg";
  const total = data.length;
  const range = req.headers.range;

  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "public, max-age=300");

  if (!range) {
    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Length", total);
    return res.send(data);
  }

  const match = /bytes=(\d*)-(\d*)/.exec(range);
  let start = match?.[1] ? parseInt(match[1], 10) : 0;
  let end = match?.[2] ? parseInt(match[2], 10) : total - 1;
  if (Number.isNaN(start) || start < 0) start = 0;
  if (Number.isNaN(end) || end >= total) end = total - 1;
  if (start > end) {
    res.status(416).setHeader("Content-Range", `bytes */${total}`);
    return res.end();
  }

  res.status(206);
  res.setHeader("Content-Range", `bytes ${start}-${end}/${total}`);
  res.setHeader("Content-Length", end - start + 1);
  res.setHeader("Content-Type", mime);
  res.send(data.slice(start, end + 1));
});

router.get("/:id", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_DETAIL_COLUMNS} FROM bands WHERE id = $1 AND status = 'aprovado'`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Grupo não encontrado." });
  res.json(rowToPublicDetail(rows[0]));
});

const REQUIRED_APPLY_FIELDS = [
  "nomeGrupo",
  "estiloMusical",
  "cidade",
  "descricao",
  "videoUrl",
  "responsavelNome",
  "cpf",
  "telefone",
  "email",
  "whatsappNumero",
];

router.post("/apply", handleUpload, async (req, res) => {
  const body = req.body || {};
  const missing = REQUIRED_APPLY_FIELDS.filter((f) => !String(body[f] || "").trim());
  if (missing.length) {
    return res.status(400).json({ error: `Campos obrigatórios faltando: ${missing.join(", ")}` });
  }
  const foto = req.files?.foto?.[0];
  const mp3 = req.files?.mp3?.[0];
  const now = Date.now();

  const { rows } = await pool.query(
    `INSERT INTO bands (
       nome_grupo, estilo_musical, cidade, descricao, video_url,
       foto_mime, foto_data, mp3_name, mp3_mime, mp3_data,
       responsavel_nome, cpf, telefone, email, whatsapp_numero,
       status, created_at, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pendente',$16,$16)
     RETURNING id`,
    [
      body.nomeGrupo,
      body.estiloMusical,
      body.cidade,
      body.descricao,
      body.videoUrl,
      foto?.mimetype || null,
      foto?.buffer || null,
      mp3?.originalname || null,
      mp3?.mimetype || null,
      mp3?.buffer || null,
      body.responsavelNome,
      body.cpf,
      body.telefone,
      body.email,
      body.whatsappNumero,
      now,
    ]
  );
  res.status(201).json({ id: rows[0].id });
});

// ---------- Admin ----------

router.get("/admin/todos", requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${ADMIN_LIST_COLUMNS} FROM bands ORDER BY
       CASE status WHEN 'pendente' THEN 0 WHEN 'aprovado' THEN 1 ELSE 2 END,
       created_at DESC`
  );
  res.json(rows.map(rowToAdminItem));
});

async function generateUniqueUsername(nomeGrupo) {
  const base = slugify(nomeGrupo);
  let candidate = base;
  let suffix = 2;
  for (;;) {
    const { rows } = await pool.query(`SELECT 1 FROM bands WHERE lower(username) = lower($1)`, [candidate]);
    if (!rows.length) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

router.post("/:id/approve", requireAdmin, async (req, res) => {
  const { rows } = await pool.query(`SELECT id, nome_grupo, username FROM bands WHERE id = $1`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Grupo não encontrado." });
  const band = rows[0];

  let credentials = null;
  if (!band.username) {
    const username = await generateUniqueUsername(band.nome_grupo);
    const password = generatePassword();
    const passwordHash = await hashPassword(password);
    await pool.query(
      `UPDATE bands SET status = 'aprovado', username = $2, password_hash = $3, updated_at = $4 WHERE id = $1`,
      [band.id, username, passwordHash, Date.now()]
    );
    credentials = { username, password };
  } else {
    await pool.query(`UPDATE bands SET status = 'aprovado', updated_at = $2 WHERE id = $1`, [band.id, Date.now()]);
  }

  res.json({ id: band.id, status: "aprovado", credentials });
});

router.post("/:id/reject", requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE bands SET status = 'rejeitado', updated_at = $2 WHERE id = $1 RETURNING id`,
    [req.params.id, Date.now()]
  );
  if (!rows.length) return res.status(404).json({ error: "Grupo não encontrado." });
  res.json({ id: rows[0].id, status: "rejeitado" });
});

router.post("/:id/reset-password", requireAdmin, async (req, res) => {
  const { rows } = await pool.query(`SELECT id, status FROM bands WHERE id = $1`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Grupo não encontrado." });
  if (rows[0].status !== "aprovado") {
    return res.status(400).json({ error: "Só é possível redefinir senha de grupos aprovados." });
  }
  const password = generatePassword();
  const passwordHash = await hashPassword(password);
  await pool.query(`UPDATE bands SET password_hash = $2, updated_at = $3 WHERE id = $1`, [
    req.params.id,
    passwordHash,
    Date.now(),
  ]);
  res.json({ id: Number(req.params.id), password });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await pool.query(`DELETE FROM bands WHERE id = $1`, [req.params.id]);
  res.status(204).end();
});

// ---------- Admin ou a própria banda ----------

const ADMIN_ONLY_PATCH_FIELDS = {
  responsavelNome: "responsavel_nome",
  cpf: "cpf",
  telefone: "telefone",
  email: "email",
};
const SHARED_PATCH_FIELDS = {
  nomeGrupo: "nome_grupo",
  estiloMusical: "estilo_musical",
  cidade: "cidade",
  descricao: "descricao",
  videoUrl: "video_url",
  whatsappNumero: "whatsapp_numero",
};

router.patch("/:id", requireAdminOrOwnBand, handleUpload, async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const fieldMap = isAdmin ? { ...SHARED_PATCH_FIELDS, ...ADMIN_ONLY_PATCH_FIELDS } : SHARED_PATCH_FIELDS;

  const sets = [];
  const params = [];
  for (const [bodyKey, column] of Object.entries(fieldMap)) {
    if (req.body[bodyKey] !== undefined) {
      params.push(req.body[bodyKey]);
      sets.push(`${column} = $${params.length}`);
    }
  }

  const foto = req.files?.foto?.[0];
  if (foto) {
    params.push(foto.mimetype);
    sets.push(`foto_mime = $${params.length}`);
    params.push(foto.buffer);
    sets.push(`foto_data = $${params.length}`);
  }
  const mp3 = req.files?.mp3?.[0];
  if (mp3) {
    params.push(mp3.originalname);
    sets.push(`mp3_name = $${params.length}`);
    params.push(mp3.mimetype);
    sets.push(`mp3_mime = $${params.length}`);
    params.push(mp3.buffer);
    sets.push(`mp3_data = $${params.length}`);
  }

  if (!sets.length) {
    return res.status(400).json({ error: "Nenhum campo para atualizar." });
  }

  params.push(Date.now());
  sets.push(`updated_at = $${params.length}`);
  params.push(req.params.id);

  const { rows } = await pool.query(
    `UPDATE bands SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING id`,
    params
  );
  if (!rows.length) return res.status(404).json({ error: "Grupo não encontrado." });
  res.json({ id: rows[0].id });
});

export default router;
