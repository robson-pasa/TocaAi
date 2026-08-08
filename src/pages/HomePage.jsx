import { Music, Mic2, Search } from "lucide-react";
import BannerCarousel from "../components/BannerCarousel.jsx";

export default function HomePage({ banners, setPage }) {
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
            onClick={() => setPage("catalog")}
            className="inline-flex items-center gap-2 bg-accent text-white font-bold px-6 py-3 rounded-full"
          >
            <Search size={18} />
            Ver catálogo
          </button>
          <button
            onClick={() => setPage("apply")}
            className="inline-flex items-center gap-2 border border-accent text-accent-dark font-bold px-6 py-3 rounded-full"
          >
            Quero me inscrever
          </button>
        </div>
      </div>
    </div>
  );
}
