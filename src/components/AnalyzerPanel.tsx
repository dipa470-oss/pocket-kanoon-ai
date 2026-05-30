import { useState, type ReactNode } from "react";
import { Upload, Loader2, FileText, Download, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { extractTextFromFile } from "@/lib/file-text";
import { exportPDF } from "@/lib/exporters";

type Severity = "low" | "medium" | "high" | "critical" | "safe";

export function severityClass(s?: string) {
  switch (s) {
    case "critical":
    case "high":
      return "bg-destructive/15 text-destructive border-destructive/40";
    case "medium":
      return "bg-amber-500/15 text-amber-500 border-amber-500/40";
    case "low":
      return "bg-emerald-500/15 text-emerald-500 border-emerald-500/40";
    case "safe":
      return "bg-emerald-500/15 text-emerald-500 border-emerald-500/40";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function AnalyzerPanel<T>({
  kind,
  title,
  accept,
  placeholder,
  language,
  onLanguageChange,
  onResult,
  onSave,
  saving,
  result,
  renderResult,
  showUpload = true,
}: {
  kind: "document" | "scam" | "notice" | "property";
  title: string;
  accept?: string;
  placeholder: string;
  language: string;
  onLanguageChange: (lang: string) => void;
  onResult: (text: string, result: T) => void;
  onSave?: () => Promise<void> | void;
  saving?: boolean;
  result: T | null;
  renderResult: (r: T) => ReactNode;
  showUpload?: boolean;
}) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFile = async (f: File | null) => {
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) {
      toast.error("File too large (max 15 MB)");
      return;
    }
    try {
      setLoading(true);
      const extracted = await extractTextFromFile(f, (m) => setStatus(m));
      setText(extracted);
      setStatus(`Extracted ${extracted.length.toLocaleString()} chars`);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to read file");
    } finally {
      setLoading(false);
    }
  };

  const analyze = async () => {
    if (!text.trim()) {
      toast.error("Provide text or upload a file first");
      return;
    }
    setLoading(true);
    setStatus("Analyzing with AI…");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, language, text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Analysis failed");
      onResult(text, json.result as T);
      setStatus("");
      toast.success("Analysis ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-xl border border-border/60 bg-card-elegant p-5">
          <h2 className="font-display text-lg font-semibold mb-3">{title}</h2>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-xs text-muted-foreground">Language</label>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="text-xs bg-background border border-border rounded px-2 py-1"
            >
              {[
                ["en", "English"], ["hi", "हिन्दी"], ["bn", "বাংলা"], ["mr", "मराठी"],
                ["ta", "தமிழ்"], ["te", "తెలుగు"], ["gu", "ગુજરાતી"], ["pa", "ਪੰਜਾਬੀ"],
                ["or", "ଓଡ଼ିଆ"], ["as", "অসমীয়া"],
              ].map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </div>
          {showUpload && (
            <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/80 p-4 cursor-pointer hover:border-primary/60 transition-colors mb-3">
              <Upload className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">Upload PDF, image or text (max 15 MB)</span>
              <input
                type="file"
                accept={accept ?? ".pdf,image/*,text/plain,.txt,.md"}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={8}
            className="w-full bg-background border border-border rounded-md p-3 text-sm font-mono resize-y"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] text-muted-foreground min-h-4">{status}</span>
            <button
              onClick={analyze}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-gradient-to-br from-gold-soft to-gold text-primary-foreground shadow-gold disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Analyze
            </button>
          </div>
        </div>
        {result && onSave && (
          <div className="flex gap-2">
            <button
              onClick={() => onSave()}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:border-primary/50"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => exportPDF(title, JSON.stringify(result, null, 2))}
              className="flex-1 inline-flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:border-primary/50"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        )}
      </div>

      <div className="lg:col-span-3">
        {result ? (
          renderResult(result)
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-muted-foreground/60" />
            AI results will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
