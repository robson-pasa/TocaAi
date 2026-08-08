import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { apiJson } from "../api.js";
import BandCard from "../components/BandCard.jsx";

const selectClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent";

export default function CatalogPage({ onOpenBand }) {
  const [filtros, setFiltros] = useState({ cidades: [], estilos: [] });
  const [cidade, setCidade] = useState("");
  const [estilo, setEstilo] = useState("");
  const [bands, setBands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson("/bands/filtros").then(setFiltros).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (cidade) params.set("cidade", cidade);
    if (estilo) params.set("estilo", estilo);
    const qs = params.toString();
    apiJson(`/bands${qs ? `?${qs}` : ""}`)
      .then(setBands)
      .catch(() => setBands([]))
      .finally(() => setLoading(false));
  }, [cidade, estilo]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ink mb-4">Catálogo de músicos</h1>

      <div className="flex flex-wrap items-center gap-3 mb-6 bg-surface border border-border rounded-xl p-3">
        <SlidersHorizontal className="text-ink-muted" size={18} />
        <select className={selectClass} value={cidade} onChange={(e) => setCidade(e.target.value)}>
          <option value="">Todas as cidades</option>
          {filtros.cidades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className={selectClass} value={estilo} onChange={(e) => setEstilo(e.target.value)}>
          <option value="">Todos os estilos</option>
          {filtros.estilos.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        {(cidade || estilo) && (
          <button
            onClick={() => {
              setCidade("");
              setEstilo("");
            }}
            className="text-sm font-semibold text-accent-dark"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-ink-muted">Carregando...</p>
      ) : bands.length === 0 ? (
        <p className="text-ink-muted">Nenhum grupo encontrado com esses filtros.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {bands.map((band) => (
            <BandCard key={band.id} band={band} onClick={() => onOpenBand(band.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
