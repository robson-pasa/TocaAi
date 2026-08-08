import { PlayCircle } from "lucide-react";
import { isYoutubeUrl, youtubeEmbedUrl, isInstagramUrl, instagramEmbedUrl } from "../api.js";

export default function VideoLink({ url }) {
  if (!url) return null;

  if (isYoutubeUrl(url)) {
    const embed = youtubeEmbedUrl(url);
    if (embed) {
      return (
        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border bg-ink/5">
          <iframe
            src={embed}
            title="Vídeo do grupo"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }

  if (isInstagramUrl(url)) {
    const embed = instagramEmbedUrl(url);
    if (embed) {
      return (
        <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-border bg-ink/5">
          <iframe
            src={embed}
            title="Vídeo do grupo"
            className="w-full aspect-[9/13]"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-secondary font-semibold hover:underline"
    >
      <PlayCircle size={20} />
      Assistir vídeo do grupo
    </a>
  );
}
