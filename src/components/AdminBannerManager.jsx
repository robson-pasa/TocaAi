import { useRef, useState } from "react";
import { UploadCloud, Trash2 } from "lucide-react";
import { apiJson, BANNER_SLOTS } from "../api.js";

export default function AdminBannerManager({ banners, setBanners }) {
  const [busySlot, setBusySlot] = useState(null);
  const [error, setError] = useState("");
  const fileInputRefs = useRef({});

  function bannerFor(slot) {
    return banners.find((b) => b.slot === slot) || { slot, hasImage: false, updatedAt: null };
  }

  async function handleUpload(slot, file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError("A imagem é muito grande (máx. 6MB). Escolha um arquivo menor.");
      return;
    }
    setError("");
    setBusySlot(slot);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const updated = await apiJson(`/banners/${slot}`, { method: "PUT", body: formData });
      setBanners((prev) => prev.map((b) => (b.slot === slot ? updated : b)));
    } catch (err) {
      setError(err.message || "Ocorreu um erro ao enviar o banner.");
    } finally {
      setBusySlot(null);
    }
  }

  async function handleRemove(slot) {
    setBusySlot(slot);
    setError("");
    try {
      await apiJson(`/banners/${slot}`, { method: "DELETE" });
      setBanners((prev) => prev.map((b) => (b.slot === slot ? { slot, hasImage: false, updatedAt: null } : b)));
    } catch (err) {
      setError(err.message || "Ocorreu um erro ao remover o banner.");
    } finally {
      setBusySlot(null);
    }
  }

  return (
    <div>
      <p className="text-sm text-ink-muted mb-4">
        Esses banners aparecem em rotação na tela inicial, trocando a cada 4 segundos. São só imagens (sem link).
      </p>

      {error && <p className="text-sm text-danger mb-3">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-3">
        {BANNER_SLOTS.map((slot) => {
          const banner = bannerFor(slot);
          const busy = busySlot === slot;
          return (
            <div key={slot} className="rounded-xl border border-border p-3">
              <p className="text-sm font-semibold text-ink mb-2">Banner {slot}</p>
              {banner.hasImage ? (
                <img
                  src={`/api/banners/${slot}/file?v=${banner.updatedAt}`}
                  alt={`Banner ${slot}`}
                  className="w-full aspect-[16/6] object-cover rounded-lg mb-2 bg-accent-light"
                />
              ) : (
                <div className="w-full aspect-[16/6] rounded-lg mb-2 bg-accent-light flex items-center justify-center text-ink-muted text-sm">
                  Sem imagem
                </div>
              )}
              <input
                ref={(el) => (fileInputRefs.current[slot] = el)}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(slot, e.target.files?.[0])}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileInputRefs.current[slot]?.click()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg bg-accent text-white disabled:opacity-50"
                >
                  <UploadCloud size={16} />
                  {banner.hasImage ? "Trocar" : "Enviar"}
                </button>
                {banner.hasImage && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleRemove(slot)}
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg border border-danger text-danger disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
