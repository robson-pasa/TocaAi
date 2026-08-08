import { Home, Search, Mic2, Wrench } from "lucide-react";

const ITEMS = [
  { key: "home", label: "Início", icon: Home },
  { key: "catalog", label: "Catálogo", icon: Search },
  { key: "apply", label: "Inscrever-se", icon: Mic2 },
  { key: "maintenance", label: "Manutenção", icon: Wrench },
];

export default function BottomNav({ page, setPage, isAuthed, role }) {
  function goTo(key) {
    if (key === "maintenance") {
      setPage(isAuthed ? (role === "admin" ? "admin" : "edit") : "login");
      return;
    }
    setPage(key);
  }

  function isActive(key) {
    if (key === "maintenance") return ["login", "admin", "edit"].includes(page);
    return page === key;
  }

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4">
        {ITEMS.map(({ key, label, icon: Icon }) => {
          const active = isActive(key);
          return (
            <button
              key={key}
              onClick={() => goTo(key)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-semibold transition ${
                active ? "text-accent-dark" : "text-ink-muted"
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
