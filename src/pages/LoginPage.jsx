import { useState } from "react";
import { LogIn } from "lucide-react";
import { postJson, setToken, decodeToken } from "../api.js";

export default function LoginPage({ onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await postJson("/login", { username, password });
      setToken(data.token);
      const claims = decodeToken(data.token);
      onLoggedIn({ role: claims.role, bandId: claims.id });
    } catch {
      setError("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
        <LogIn className="text-accent" size={24} />
        Manutenção
      </h1>
      <p className="text-ink-muted mb-6 text-sm">
        Área do administrador e dos grupos aprovados.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-semibold text-ink mb-1">Usuário</span>
          <input
            required
            autoFocus
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-ink mb-1">Senha</span>
          <input
            required
            type="password"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white font-bold py-3 rounded-full disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
