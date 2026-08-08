import { Disc3, Wrench, LogOut } from "lucide-react";

export default function Header({ page, setPage, isAuthed, role, onLogout }) {
  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => setPage("home")}
          className="flex items-center gap-2 font-extrabold text-ink text-lg shrink-0"
        >
          <Disc3 className="text-accent" size={26} />
          TocaAi
        </button>

        <nav className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => setPage("catalog")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
              page === "catalog" ? "bg-accent-light text-accent-dark" : "text-ink-muted hover:text-ink"
            }`}
          >
            Catálogo
          </button>
          <button
            onClick={() => setPage("apply")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
              page === "apply" ? "bg-accent-light text-accent-dark" : "text-ink-muted hover:text-ink"
            }`}
          >
            Quero me inscrever
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthed && (
            <button
              onClick={onLogout}
              title="Sair"
              className="p-2 rounded-lg text-ink-muted hover:text-danger hover:bg-danger-light transition"
            >
              <LogOut size={20} />
            </button>
          )}
          <button
            onClick={() => setPage(isAuthed ? (role === "admin" ? "admin" : "edit") : "login")}
            title="Manutenção"
            className={`p-2 rounded-lg transition ${
              page === "admin" || page === "edit" || page === "login"
                ? "bg-accent-light text-accent-dark"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <Wrench size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
