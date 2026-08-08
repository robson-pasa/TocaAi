import { useEffect, useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { apiJson } from "../api.js";
import AudioUploadField from "../components/AudioUploadField.jsx";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink mb-1">{label}</span>
      {children}
    </label>
  );
}

export default function MusicianEditPage({ bandId }) {
  const [form, setForm] = useState(null);
  const [foto, setFoto] = useState(null);
  const [mp3, setMp3] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiJson(`/bands/${bandId}`).then((band) =>
      setForm({
        nomeGrupo: band.nomeGrupo,
        estiloMusical: band.estiloMusical,
        cidade: band.cidade,
        descricao: band.descricao,
        videoUrl: band.videoUrl,
        whatsappNumero: band.whatsappNumero,
        hasFoto: band.hasFoto,
        hasMp3: band.hasMp3,
      })
    );
  }, [bandId]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      ["nomeGrupo", "estiloMusical", "cidade", "descricao", "videoUrl", "whatsappNumero"].forEach((k) =>
        formData.append(k, form[k] || "")
      );
      if (foto) formData.append("foto", foto);
      if (mp3) formData.append("mp3", mp3);
      await apiJson(`/bands/${bandId}`, { method: "PATCH", body: formData });
      setSaved(true);
      setFoto(null);
      setMp3(null);
    } catch (err) {
      setError(err.message || "Não foi possível salvar.");
    } finally {
      setLoading(false);
    }
  }

  if (!form) {
    return <div className="max-w-2xl mx-auto px-4 py-10 text-ink-muted">Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-ink mb-1">Editar meu grupo</h1>
      <p className="text-ink-muted mb-6">Atualize os dados que aparecem no catálogo público.</p>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome do grupo/dupla">
          <input
            required
            className={inputClass}
            value={form.nomeGrupo}
            onChange={(e) => update("nomeGrupo", e.target.value)}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Estilo musical">
            <input
              required
              className={inputClass}
              value={form.estiloMusical}
              onChange={(e) => update("estiloMusical", e.target.value)}
            />
          </Field>
          <Field label="Cidade">
            <input
              required
              className={inputClass}
              value={form.cidade}
              onChange={(e) => update("cidade", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Descrição">
          <textarea
            rows={4}
            className={inputClass}
            value={form.descricao}
            onChange={(e) => update("descricao", e.target.value)}
          />
        </Field>

        <Field label="Link do vídeo">
          <input
            type="url"
            className={inputClass}
            value={form.videoUrl}
            onChange={(e) => update("videoUrl", e.target.value)}
          />
        </Field>

        <Field label={`Foto ${form.hasFoto ? "(trocar)" : "(enviar)"}`}>
          <input
            type="file"
            accept="image/*"
            className={inputClass}
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
          />
        </Field>

        <AudioUploadField
          value={mp3}
          onChange={setMp3}
          label={`Áudio ${form.hasMp3 ? "(trocar)" : "(enviar)"}`}
        />

        <Field label="WhatsApp para receber mensagens de contato">
          <input
            required
            className={inputClass}
            value={form.whatsappNumero}
            onChange={(e) => update("whatsappNumero", e.target.value)}
          />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && (
          <p className="text-sm text-secondary flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Alterações salvas.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-accent text-white font-bold px-6 py-3 rounded-full disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
