# TocaAi

Catálogo de músicos e bandas — filtre por cidade e estilo musical, veja vídeo, descrição e uma amostra em mp3 de cada grupo, e entre em contato direto pelo WhatsApp.

## Desenvolvimento local

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL, ADMIN_USER, ADMIN_PASS, SESSION_SECRET
npm run dev:server      # terminal 1 — API em :8080
npm run dev:client      # terminal 2 — Vite em :5173, proxy /api -> :8080
```

## Build de produção

```bash
npm run build
npm start
```
