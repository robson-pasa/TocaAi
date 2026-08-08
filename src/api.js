export const BANNER_SLOTS = [1, 2, 3, 4, 5];

const TOKEN_KEY = "tocaai_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function apiJson(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData && options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch("/api" + url, { ...options, headers });
  if (!res.ok) {
    let msg = "Erro na requisição";
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {
      /* resposta sem corpo JSON */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function postJson(url, body, options = {}) {
  return apiJson(url, { ...options, method: "POST", body: JSON.stringify(body) });
}

export function patchJson(url, body, options = {}) {
  return apiJson(url, { ...options, method: "PATCH", body: JSON.stringify(body) });
}

export const WHATSAPP_MESSAGE = "Olá, quero informações para tocar em uma festa.";

export function whatsappLink(numero) {
  const digits = String(numero || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

export function isYoutubeUrl(url) {
  return /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)/i.test(String(url || ""));
}

export function youtubeEmbedUrl(url) {
  const str = String(url || "");
  let id = "";
  const watch = str.match(/[?&]v=([^&]+)/);
  const short = str.match(/youtu\.be\/([^?&]+)/);
  const shorts = str.match(/shorts\/([^?&]+)/);
  id = watch?.[1] || short?.[1] || shorts?.[1] || "";
  return id ? `https://www.youtube.com/embed/${id}` : "";
}

export function isInstagramUrl(url) {
  return /instagram\.com\/(?:p|reel|tv)\//i.test(String(url || ""));
}

export function instagramEmbedUrl(url) {
  const str = String(url || "");
  const match = str.match(/instagram\.com\/(p|reel|tv)\/([^/?#]+)/i);
  return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed` : "";
}
