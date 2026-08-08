import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { initDb } from "./db.js";
import loginRoutes from "./routes/login.js";
import bandsRoutes from "./routes/bands.js";
import bannerRoutes from "./routes/banners.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

app.use("/api/login", loginRoutes);
app.use("/api/bands", bandsRoutes);
app.use("/api/banners", bannerRoutes);

const distDir = path.join(__dirname, "..", "dist");
app.use(express.static(distDir));
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

const PORT = process.env.PORT || 8080;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Falha ao inicializar o banco de dados:", err);
    process.exit(1);
  });
