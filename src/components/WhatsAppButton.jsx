import { MessageCircle } from "lucide-react";
import { whatsappLink } from "../api.js";

export default function WhatsAppButton({ numero, className = "" }) {
  if (!numero) return null;
  return (
    <a
      href={whatsappLink(numero)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-whatsapp text-white font-semibold px-5 py-3 rounded-full shadow-sm hover:brightness-95 transition ${className}`}
    >
      <MessageCircle size={20} />
      Falar no WhatsApp
    </a>
  );
}
