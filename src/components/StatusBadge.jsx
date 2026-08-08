const STYLES = {
  pendente: "bg-accent-light text-accent-dark",
  aprovado: "bg-secondary-light text-secondary",
  rejeitado: "bg-danger-light text-danger",
};

const LABELS = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STYLES[status] || ""}`}>
      {LABELS[status] || status}
    </span>
  );
}
