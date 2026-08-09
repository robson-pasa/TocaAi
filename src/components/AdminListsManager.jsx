import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { apiJson } from "../api.js";

function ListColumn({ title, items, endpoint, onChange }) {
  const [novo, setNovo] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function add(e) {
    e.preventDefault();
    const nome = novo.trim();
    if (!nome) return;
    setError("");
    try {
      const created = await apiJson(endpoint, { method: "POST", body: JSON.stringify({ nome }) });
      onChange([...items, created].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNovo("");
    } catch (err) {
      setError(err.message || "Não foi possível adicionar.");
    }
  }

  async function remove(id) {
    setBusyId(id);
    setError("");
    try {
      await apiJson(`${endpoint}/${id}`, { method: "DELETE" });
      onChange(items.filter((i) => i.id !== id));
    } catch (err) {
      setError(err.message || "Não foi possível remover.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-sm font-semibold text-ink mb-2">{title}</p>
      <form onSubmit={add} className="flex gap-2 mb-3">
        <input
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          placeholder="Adicionar..."
        />
        <button type="submit" className="px-3 py-2 rounded-lg bg-accent text-white">
          <Plus size={16} />
        </button>
      </form>
      {error && <p className="text-sm text-danger mb-2">{error}</p>}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between text-sm py-1">
            <span className="text-ink">{item.nome}</span>
            <button
              disabled={busyId === item.id}
              onClick={() => remove(item.id)}
              className="text-ink-muted hover:text-danger disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminListsManager({ cidades, estilos, onCidadesChange, onEstilosChange }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <ListColumn title="Cidades" items={cidades} endpoint="/listas/cidades" onChange={onCidadesChange} />
      <ListColumn title="Estilos musicais" items={estilos} endpoint="/listas/estilos" onChange={onEstilosChange} />
    </div>
  );
}
