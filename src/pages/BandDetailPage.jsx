import { useEffect, useState } from "react";
import { ArrowLeft, Music, MapPin } from "lucide-react";
import { apiJson } from "../api.js";
import VideoLink from "../components/VideoLink.jsx";
import AudioPlayer from "../components/AudioPlayer.jsx";
import WhatsAppButton from "../components/WhatsAppButton.jsx";

export default function BandDetailPage({ bandId, onBack }) {
  const [band, setBand] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setBand(null);
    setError("");
    apiJson(`/bands/${bandId}`)
      .then(setBand)
      .catch(() => setError("Não foi possível carregar esse grupo."));
  }, [bandId]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-danger">{error}</p>
        <button onClick={onBack} className="mt-4 text-accent-dark font-semibold">
          Voltar ao catálogo
        </button>
      </div>
    );
  }

  if (!band) {
    return <div className="max-w-3xl mx-auto px-4 py-10 text-ink-muted">Carregando...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink mb-4"
      >
        <ArrowLeft size={16} />
        Voltar ao catálogo
      </button>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
        <div className="aspect-[16/7] bg-accent-light flex items-center justify-center overflow-hidden">
          {band.hasFoto ? (
            <img src={`/api/bands/${band.id}/foto`} alt={band.nomeGrupo} className="w-full h-full object-cover" />
          ) : (
            <Music className="text-accent" size={64} />
          )}
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-extrabold text-ink mb-2">{band.nomeGrupo}</h1>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary-light text-secondary">
              {band.estiloMusical}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-ink-muted">
              <MapPin size={14} />
              {band.cidade}
            </span>
          </div>

          {band.descricao && <p className="text-ink mb-6 whitespace-pre-line">{band.descricao}</p>}

          <div className="space-y-4 mb-6">
            <VideoLink url={band.videoUrl} />
            <AudioPlayer hasMp3={band.hasMp3} src={`/api/bands/${band.id}/mp3`} />
          </div>

          <WhatsAppButton numero={band.whatsappNumero} />
        </div>
      </div>
    </div>
  );
}
