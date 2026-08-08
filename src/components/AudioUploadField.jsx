import { useEffect, useRef, useState } from "react";
import { UploadCloud, Mic, Square, X, Music2 } from "lucide-react";

const RECORD_MIME_CANDIDATES = ["audio/webm", "audio/mp4", "audio/ogg"];

function pickRecordMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return RECORD_MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

function extFor(mime) {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "audio";
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AudioUploadField({ value, onChange, label = "Uma música do grupo (áudio)" }) {
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!value) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handleFilePicked(file) {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Selecione um arquivo de áudio.");
      return;
    }
    setError("");
    onChange(file);
  }

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickRecordMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        const file = new File([blob], `gravacao-${Date.now()}.${extFor(type)}`, { type });
        onChange(file);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Não foi possível acessar o microfone. Verifique a permissão do navegador.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  }

  function clearValue() {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <span className="block text-sm font-semibold text-ink mb-1">{label}</span>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleFilePicked(e.target.files?.[0] || null)}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={recording}
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg border border-border text-ink disabled:opacity-50"
        >
          <UploadCloud size={16} />
          Enviar arquivo
        </button>

        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg border border-accent text-accent-dark"
          >
            <Mic size={16} />
            Gravar agora
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg bg-danger text-white"
          >
            <Square size={16} />
            Parar ({formatTime(seconds)})
          </button>
        )}
      </div>

      {error && <p className="text-sm text-danger mt-2">{error}</p>}

      {value && (
        <div className="mt-3 bg-accent-light rounded-lg p-3 flex items-center gap-3">
          <Music2 className="text-accent shrink-0" size={20} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink truncate">{value.name}</p>
            {previewUrl && <audio controls src={previewUrl} className="w-full mt-1 h-8" />}
          </div>
          <button type="button" onClick={clearValue} className="text-ink-muted hover:text-danger shrink-0">
            <X size={18} />
          </button>
        </div>
      )}

      <span className="block text-xs text-ink-muted mt-1">
        Qualquer formato de áudio (mp3, wav, m4a...) — envie um arquivo já pronto ou grave agora pelo microfone.
      </span>
    </div>
  );
}
