import { Music } from "lucide-react";

export default function BandCard({ band, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition group"
    >
      <div className="aspect-square w-full bg-accent-light flex items-center justify-center overflow-hidden">
        {band.hasFoto ? (
          <img
            src={`/api/bands/${band.id}/foto`}
            alt={band.nomeGrupo}
            className="w-full h-full object-cover"
          />
        ) : (
          <Music className="text-accent" size={48} />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-ink text-lg leading-tight group-hover:text-accent-dark transition">
          {band.nomeGrupo}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary-light text-secondary">
            {band.estiloMusical}
          </span>
          <span className="text-xs text-ink-muted">{band.cidade}</span>
        </div>
      </div>
    </button>
  );
}
