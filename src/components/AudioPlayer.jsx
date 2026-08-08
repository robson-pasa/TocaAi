import { Music2 } from "lucide-react";

export default function AudioPlayer({ src, hasMp3 }) {
  if (!hasMp3) return null;
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
      <Music2 className="text-accent shrink-0" size={22} />
      <audio controls preload="none" src={src} className="w-full">
        Seu navegador não suporta áudio.
      </audio>
    </div>
  );
}
