import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { apiJson } from "../api.js";

const EMPTY = {
  nomeGrupo: "",
  estiloMusical: "",
  cidade: "",
  descricao: "",
  videoUrl: "",
  responsavelNome: "",
  cpf: "",
  telefone: "",
  email: "",
  whatsappNumero: "",
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent";

export default function ApplyPage() {
  const [form, setForm] = useState(EMPTY);
  const [foto, setFoto] = useState(null);
  const [mp3, setMp3] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!mp3) {
      setError("Envie um arquivo de áudio com uma música do grupo.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (foto) formData.append("foto", foto);
      formData.append("mp3", mp3);
      await apiJson("/bands/apply", { method: "POST", body: formData });
      setDone(true);
    } catch (err) {
      setError(err.message || "Não foi possível enviar sua inscrição.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto text-secondary mb-4" size={56} />
        <h1 className="text-2xl font-bold text-ink mb-2">Inscrição enviada!</h1>
        <p className="text-ink-muted">
          Recebemos os dados do seu grupo. Nossa equipe vai analisar e, se aprovado, você recebe um
          login e senha para entrar no catálogo.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-ink mb-1">Quero me inscrever</h1>
      <p className="text-ink-muted mb-6">
        Preencha os dados do seu grupo ou dupla. Depois da aprovação, você entra no catálogo e recebe um
        login para editar essas informações.
      </p>

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
              placeholder="Ex: Sertanejo, MPB, Rock..."
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
            required
            rows={4}
            className={inputClass}
            value={form.descricao}
            onChange={(e) => update("descricao", e.target.value)}
            placeholder="Conte um pouco sobre o grupo, repertório, tempo de estrada..."
          />
        </Field>

        <Field label="Link do vídeo (YouTube ou outro)">
          <input
            required
            type="url"
            className={inputClass}
            value={form.videoUrl}
            onChange={(e) => update("videoUrl", e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Foto do grupo (opcional)">
            <input
              type="file"
              accept="image/*"
              className={inputClass}
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
            />
          </Field>
          <Field label="Uma música do grupo (áudio)">
            <input
              required
              type="file"
              accept="audio/*"
              capture
              className={inputClass}
              onChange={(e) => setMp3(e.target.files?.[0] || null)}
            />
            <span className="block text-xs text-ink-muted mt-1">
              Qualquer formato de áudio (mp3, wav, m4a...) — pode ser uma gravação feita na hora, inclusive tirada do
              áudio de um vídeo.
            </span>
          </Field>
        </div>

        <hr className="border-border" />
        <p className="text-sm font-semibold text-ink-muted">Dados de contato</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Responsável">
            <input
              required
              className={inputClass}
              value={form.responsavelNome}
              onChange={(e) => update("responsavelNome", e.target.value)}
            />
          </Field>
          <Field label="CPF">
            <input
              required
              className={inputClass}
              value={form.cpf}
              onChange={(e) => update("cpf", e.target.value)}
            />
          </Field>
          <Field label="Telefone">
            <input
              required
              className={inputClass}
              value={form.telefone}
              onChange={(e) => update("telefone", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
        </div>

        <Field label="WhatsApp para receber mensagens de contato">
          <input
            required
            className={inputClass}
            value={form.whatsappNumero}
            onChange={(e) => update("whatsappNumero", e.target.value)}
            placeholder="(67) 99999-9999"
          />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white font-bold py-3 rounded-full disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar inscrição"}
        </button>
      </form>
    </div>
  );
}
