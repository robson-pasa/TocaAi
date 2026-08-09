import pg from "pg";

const { Pool } = pg;

const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

export const BANNER_SLOTS = [1, 2, 3, 4, 5];

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bands (
      id SERIAL PRIMARY KEY,
      nome_grupo TEXT NOT NULL,
      estilo_musical TEXT NOT NULL,
      cidade TEXT NOT NULL,
      descricao TEXT,
      video_url TEXT,
      foto_mime TEXT,
      foto_data BYTEA,
      mp3_name TEXT,
      mp3_mime TEXT,
      mp3_data BYTEA,
      responsavel_nome TEXT NOT NULL,
      cpf TEXT NOT NULL,
      telefone TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp_numero TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','rejeitado')),
      username TEXT UNIQUE,
      password_hash TEXT,
      created_at BIGINT,
      updated_at BIGINT
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_bands_status ON bands (status);
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS banners (
      slot INTEGER PRIMARY KEY,
      mime_type TEXT,
      image_data BYTEA,
      updated_at BIGINT
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cidades (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL UNIQUE
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS estilos_musicais (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL UNIQUE
    );
  `);
  await pool.query(`
    INSERT INTO cidades (nome)
    SELECT DISTINCT trim(cidade) FROM bands
    WHERE cidade IS NOT NULL AND trim(cidade) <> ''
    ON CONFLICT (nome) DO NOTHING;
  `);
  await pool.query(`
    INSERT INTO estilos_musicais (nome)
    SELECT DISTINCT trim(estilo_musical) FROM bands
    WHERE estilo_musical IS NOT NULL AND trim(estilo_musical) <> ''
    ON CONFLICT (nome) DO NOTHING;
  `);
}

const PUBLIC_LIST_COLUMNS = `
  id, nome_grupo, estilo_musical, cidade,
  (foto_data IS NOT NULL) AS has_foto,
  (mp3_data IS NOT NULL) AS has_mp3,
  updated_at
`;

const PUBLIC_DETAIL_COLUMNS = `
  id, nome_grupo, estilo_musical, cidade, descricao, video_url, whatsapp_numero,
  (foto_data IS NOT NULL) AS has_foto,
  (mp3_data IS NOT NULL) AS has_mp3,
  updated_at
`;

const ADMIN_LIST_COLUMNS = `
  id, nome_grupo, estilo_musical, cidade, descricao, video_url,
  responsavel_nome, cpf, telefone, email, whatsapp_numero,
  status, username,
  (foto_data IS NOT NULL) AS has_foto,
  (mp3_data IS NOT NULL) AS has_mp3,
  created_at, updated_at
`;

export function rowToPublicListItem(row) {
  return {
    id: row.id,
    nomeGrupo: row.nome_grupo,
    estiloMusical: row.estilo_musical,
    cidade: row.cidade,
    hasFoto: row.has_foto,
    hasMp3: row.has_mp3,
    updatedAt: Number(row.updated_at),
  };
}

export function rowToPublicDetail(row) {
  return {
    id: row.id,
    nomeGrupo: row.nome_grupo,
    estiloMusical: row.estilo_musical,
    cidade: row.cidade,
    descricao: row.descricao || "",
    videoUrl: row.video_url || "",
    whatsappNumero: row.whatsapp_numero,
    hasFoto: row.has_foto,
    hasMp3: row.has_mp3,
    updatedAt: Number(row.updated_at),
  };
}

export function rowToAdminItem(row) {
  return {
    id: row.id,
    nomeGrupo: row.nome_grupo,
    estiloMusical: row.estilo_musical,
    cidade: row.cidade,
    descricao: row.descricao || "",
    videoUrl: row.video_url || "",
    responsavelNome: row.responsavel_nome,
    cpf: row.cpf,
    telefone: row.telefone,
    email: row.email,
    whatsappNumero: row.whatsapp_numero,
    status: row.status,
    username: row.username || "",
    hasFoto: row.has_foto,
    hasMp3: row.has_mp3,
    createdAt: row.created_at ? Number(row.created_at) : null,
    updatedAt: row.updated_at ? Number(row.updated_at) : null,
  };
}

export { PUBLIC_LIST_COLUMNS, PUBLIC_DETAIL_COLUMNS, ADMIN_LIST_COLUMNS };
