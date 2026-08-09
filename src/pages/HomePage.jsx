import { useEffect, useMemo, useState } from "react";
import { Music, Mic2, ArrowRight } from "lucide-react";
import { apiJson } from "../api.js";
import BannerCarousel from "../components/BannerCarousel.jsx";
import BandCard from "../components/BandCard.jsx";

function pickRandom(list, count) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export default function HomePage({ banners, setPage, onOpenBand }) {
  const [bands, setBands] = useState([]);

  useEffect(() => {
    apiJson("/bands").then(setBands).catch(() => {});
  }, []);

  const featured = useMemo(() => pickRandom(bands, 4), [bands]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BannerCarousel banners={banners} />

      <div className="text-center py-10">
        <div className="flex justify-center gap-3 text-accent mb-4">
          <Music size={28} />
          <Mic2 size={28} />
          <Music size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-3">
          Encontre a trilha sonora da sua festa
        </h1>
        <p className="text-ink-muted max-w-xl mx-auto mb-8">
          Catálogo de músicos e bandas prontos para tocar no seu evento. Filtre por cidade e estilo,
          ouça uma amostra e chame direto no WhatsApp.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setPage("apply")}
            className="inline-flex items-center gap-2 border border-accent text-accent-dark font-bold px-6 py-3 rounded-full"
          >
            Quero me inscrever
          </button>
        </div>
      </div>

      {featured.length > 0 && (
        <div className="pt-4">
          <h2 className="text-xl font-bold text-ink mb-4">Grupos em destaque</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {featured.map((band) => (
              <BandCard key={band.id} band={band} onClick={() => onOpenBand(band.id)} />
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={() => setPage("catalog")}
              className="inline-flex items-center gap-2 bg-accent text-white font-bold px-6 py-3 rounded-full"
            >
              Ver todos
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
