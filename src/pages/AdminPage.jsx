import { useEffect, useState } from "react";
import { Check, X, Trash2, KeyRound, Pencil, Copy } from "lucide-react";
import { apiJson } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import AdminBannerManager from "../components/AdminBannerManager.jsx";
import AdminListsManager from "../components/AdminListsManager.jsx";

const TABS = [
  { key: "pendentes", label: "Pendentes" },
  { key: "todos", label: "Todos os Grupos" },
  { key: "banners", label: "Banners" },
  { key: "listas", label: "Cidades e Estilos" },
];

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent";

function CredentialsModal({ credentials, onClose }) {
  if (!credentials) return null;
  const text = `Usuário: ${credentials.username}\nSenha: ${credentials.password}`;
  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-lg max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-ink text-lg mb-2">Credenciais geradas</h3>
        <p className="text-sm text-ink-muted mb-4">
          Copie e repasse ao músico agora — a senha não aparece de novo depois que você fechar esta janela.
        </p>
        <div className="bg-accent-light rounded-lg p-3 mb-4 font-mono text-sm text-ink">
          <p>Usuário: {credentials.username}</p>
          <p>Senha: {credentials.password}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard?.writeText(text)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg border border-border text-ink"
          >
            <Copy size={16} />
            Copiar
          </button>
          <button
            onClick={onClose}
            className="flex-1 text-sm font-semibold px-3 py-2 rounded-lg bg-accent text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function EditBandModal({ band, cidades, estilos, onClose, onSaved }) {
  const [form, setForm] = useState({
    nomeGrupo: band.nomeGrupo,
    estiloMusical: band.estiloMusical,
    cidade: band.cidade,
    descricao: band.descricao,
    videoUrl: band.videoUrl,
    responsavelNome: band.responsavelNome,
    cpf: band.cpf,
    telefone: band.telefone,
    email: band.email,
    whatsappNumero: band.whatsappNumero,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await apiJson(`/bands/${band.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onSaved();
    } catch (err) {
      setError(err.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl shadow-lg max-w-lg w-full p-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-ink text-lg mb-4">Editar {band.nomeGrupo}</h3>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {[["nomeGrupo", "Nome do grupo"]].map(([key, label]) => (
            <label key={key} className="block">
              <span className="block text-xs font-semibold text-ink-muted mb-1">{label}</span>
              <input className={inputClass} value={form[key] || ""} onChange={(e) => update(key, e.target.value)} />
            </label>
          ))}
          <label className="block">
            <span className="block text-xs font-semibold text-ink-muted mb-1">Estilo musical</span>
            <select
              className={inputClass}
              value={form.estiloMusical || ""}
              onChange={(e) => update("estiloMusical", e.target.value)}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {estilos.map((o) => (
                <option key={o.id} value={o.nome}>
                  {o.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-ink-muted mb-1">Cidade</span>
            <select
              className={inputClass}
              value={form.cidade || ""}
              onChange={(e) => update("cidade", e.target.value)}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {cidades.map((o) => (
                <option key={o.id} value={o.nome}>
                  {o.nome}
                </option>
              ))}
            </select>
          </label>
          {[
            ["videoUrl", "Link do vídeo"],
            ["responsavelNome", "Responsável"],
            ["cpf", "CPF"],
            ["telefone", "Telefone"],
            ["email", "Email"],
            ["whatsappNumero", "WhatsApp"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="block text-xs font-semibold text-ink-muted mb-1">{label}</span>
              <input className={inputClass} value={form[key] || ""} onChange={(e) => update(key, e.target.value)} />
            </label>
          ))}
          <label className="block">
            <span className="block text-xs font-semibold text-ink-muted mb-1">Descrição</span>
            <textarea
              rows={3}
              className={inputClass}
              value={form.descricao || ""}
              onChange={(e) => update("descricao", e.target.value)}
            />
          </label>
        </div>
        {error && <p className="text-sm text-danger mt-3">{error}</p>}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 text-sm font-semibold px-3 py-2 rounded-lg border border-border text-ink">
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 text-sm font-semibold px-3 py-2 rounded-lg bg-accent text-white disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState("pendentes");
  const [bands, setBands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [estilos, setEstilos] = useState([]);
  const [credentials, setCredentials] = useState(null);
  const [editingBand, setEditingBand] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  function reloadBands() {
    setLoading(true);
    apiJson("/bands/admin/todos")
      .then(setBands)
      .catch(() => setBands([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reloadBands();
    apiJson("/banners").then(setBanners).catch(() => {});
    apiJson("/listas/cidades").then(setCidades).catch(() => {});
    apiJson("/listas/estilos").then(setEstilos).catch(() => {});
  }, []);

  async function approve(id) {
    const data = await apiJson(`/bands/${id}/approve`, { method: "POST" });
    if (data.credentials) setCredentials(data.credentials);
    reloadBands();
  }

  async function reject(id) {
    await apiJson(`/bands/${id}/reject`, { method: "POST" });
    reloadBands();
  }

  async function remove(id) {
    await apiJson(`/bands/${id}`, { method: "DELETE" });
    reloadBands();
  }

  async function resetPassword(id) {
    const data = await apiJson(`/bands/${id}/reset-password`, { method: "POST" });
    setCredentials({ username: bands.find((b) => b.id === id)?.username, password: data.password });
  }

  const pendentes = bands.filter((b) => b.status === "pendente");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ink mb-4">Administração</h1>

      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t.key ? "border-accent text-accent-dark" : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
            {t.key === "pendentes" && pendentes.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center bg-accent text-white text-xs rounded-full w-5 h-5">
                {pendentes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "banners" && <AdminBannerManager banners={banners} setBanners={setBanners} />}

      {tab === "listas" && (
        <AdminListsManager
          cidades={cidades}
          estilos={estilos}
          onCidadesChange={setCidades}
          onEstilosChange={setEstilos}
        />
      )}

      {tab !== "banners" && tab !== "listas" && loading && <p className="text-ink-muted">Carregando...</p>}

      {tab === "pendentes" && !loading && (
        <div className="space-y-3">
          {pendentes.length === 0 && <p className="text-ink-muted">Nenhuma inscrição pendente.</p>}
          {pendentes.map((band) => (
            <div key={band.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-ink">{band.nomeGrupo}</h3>
                  <p className="text-sm text-ink-muted">
                    {band.estiloMusical} · {band.cidade}
                  </p>
                  <p className="text-sm text-ink mt-1">{band.descricao}</p>
                  <div className="text-xs text-ink-muted mt-2 space-y-0.5">
                    <p>Responsável: {band.responsavelNome} · CPF: {band.cpf}</p>
                    <p>Telefone: {band.telefone} · Email: {band.email}</p>
                    <p>WhatsApp de contato: {band.whatsappNumero}</p>
                    {band.videoUrl && (
                      <p>
                        Vídeo:{" "}
                        <a href={band.videoUrl} target="_blank" rel="noreferrer" className="text-secondary underline">
                          {band.videoUrl}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => approve(band.id)}
                    className="inline-flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg bg-secondary text-white"
                  >
                    <Check size={16} /> Aprovar
                  </button>
                  <button
                    onClick={() =>
                      setConfirmAction({
                        title: "Rejeitar inscrição?",
                        message: `${band.nomeGrupo} não entrará no catálogo.`,
                        danger: true,
                        run: () => reject(band.id),
                      })
                    }
                    className="inline-flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg border border-danger text-danger"
                  >
                    <X size={16} /> Rejeitar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "todos" && !loading && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-muted border-b border-border">
                <th className="py-2 pr-3">Grupo</th>
                <th className="py-2 pr-3">Cidade</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Usuário</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {bands.map((band) => (
                <tr key={band.id} className="border-b border-border">
                  <td className="py-2 pr-3 font-semibold text-ink">{band.nomeGrupo}</td>
                  <td className="py-2 pr-3 text-ink-muted">{band.cidade}</td>
                  <td className="py-2 pr-3">
                    <StatusBadge status={band.status} />
                  </td>
                  <td className="py-2 pr-3 text-ink-muted font-mono">{band.username || "—"}</td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        title="Editar"
                        onClick={() => setEditingBand(band)}
                        className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-accent-light"
                      >
                        <Pencil size={16} />
                      </button>
                      {band.status === "aprovado" && (
                        <button
                          title="Gerar nova senha"
                          onClick={() => resetPassword(band.id)}
                          className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-accent-light"
                        >
                          <KeyRound size={16} />
                        </button>
                      )}
                      {band.status !== "aprovado" && (
                        <button
                          title="Aprovar"
                          onClick={() => approve(band.id)}
                          className="p-1.5 rounded-lg text-ink-muted hover:text-secondary hover:bg-secondary-light"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        title="Excluir"
                        onClick={() =>
                          setConfirmAction({
                            title: "Excluir grupo?",
                            message: `Isso remove ${band.nomeGrupo} definitivamente, incluindo foto e mp3.`,
                            danger: true,
                            run: () => remove(band.id),
                          })
                        }
                        className="p-1.5 rounded-lg text-ink-muted hover:text-danger hover:bg-danger-light"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />

      {editingBand && (
        <EditBandModal
          band={editingBand}
          cidades={cidades}
          estilos={estilos}
          onClose={() => setEditingBand(null)}
          onSaved={() => {
            setEditingBand(null);
            reloadBands();
          }}
        />
      )}

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        danger={confirmAction?.danger}
        confirmLabel="Confirmar"
        onCancel={() => setConfirmAction(null)}
        onConfirm={async () => {
          await confirmAction.run();
          setConfirmAction(null);
        }}
      />
    </div>
  );
}
