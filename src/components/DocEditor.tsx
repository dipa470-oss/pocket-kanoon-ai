import { Loader2, Sparkles, Save, FileDown, Printer, FileText as FileIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { exportPDF, exportDOCX, printDocument } from "@/lib/exporters";
import type { FieldDef } from "@/lib/complaint-types";

const LANGS = [
  ["en", "English"], ["hi", "हिन्दी"], ["bn", "বাংলা"], ["mr", "मराठी"],
  ["ta", "தமிழ்"], ["te", "తెలుగు"], ["gu", "ગુજરાતી"], ["pa", "ਪੰਜਾਬੀ"],
  ["or", "ଓଡ଼ିଆ"], ["as", "অসমীয়া"],
] as const;

export type DocEditorProps = {
  title: string;
  onTitleChange: (v: string) => void;
  fields: FieldDef[];
  formData: Record<string, string>;
  onFormChange: (data: Record<string, string>) => void;
  language: string;
  onLanguageChange: (v: string) => void;
  content: string;
  onContentChange: (v: string) => void;
  generating: boolean;
  saving: boolean;
  onGenerate: () => void;
  onSave: () => void;
  headerNote?: string;
};

export function DocEditor(p: DocEditorProps) {
  const [tab, setTab] = useState<"form" | "draft">("form");

  const tryExport = (fn: () => unknown) => {
    if (!p.content.trim()) { toast.error("Generate or write the draft first"); return; }
    try { fn(); } catch (e) { toast.error(String(e)); }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
      {/* Form */}
      <div className="rounded-xl border border-border/60 bg-card-elegant p-5 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Details</h2>
          <select
            value={p.language}
            onChange={(e) => p.onLanguageChange(e.target.value)}
            className="text-xs bg-background border border-border rounded-md px-2 py-1"
          >
            {LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        <label className="block text-xs text-muted-foreground mb-1">Title</label>
        <input
          value={p.title}
          onChange={(e) => p.onTitleChange(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-md bg-background border border-border text-sm"
        />

        {p.headerNote && <p className="text-[11px] text-muted-foreground mb-4">{p.headerNote}</p>}

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {p.fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs text-muted-foreground mb-1">
                {f.label}{f.required && <span className="text-destructive"> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={p.formData[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => p.onFormChange({ ...p.formData, [f.name]: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm"
                />
              ) : (
                <input
                  type={f.type}
                  value={p.formData[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => p.onFormChange({ ...p.formData, [f.name]: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm"
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={p.onGenerate}
          disabled={p.generating}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-gradient-to-br from-gold-soft to-gold text-primary-foreground shadow-gold font-medium disabled:opacity-60"
        >
          {p.generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {p.content ? "Regenerate with AI" : "Generate with AI"}
        </button>
      </div>

      {/* Draft */}
      <div className="rounded-xl border border-border/60 bg-card-elegant p-5 lg:p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="inline-flex rounded-md border border-border bg-background p-0.5">
            <button onClick={() => setTab("form")} className={`px-3 py-1 text-xs rounded ${tab === "form" ? "bg-accent" : "text-muted-foreground"}`}>Preview</button>
            <button onClick={() => setTab("draft")} className={`px-3 py-1 text-xs rounded ${tab === "draft" ? "bg-accent" : "text-muted-foreground"}`}>Edit</button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <ToolbarBtn onClick={p.onSave} disabled={p.saving} icon={p.saving ? Loader2 : Save} label="Save" spin={p.saving} />
            <ToolbarBtn onClick={() => tryExport(() => exportPDF(p.title, p.content))} icon={FileDown} label="PDF" />
            <ToolbarBtn onClick={() => tryExport(() => exportDOCX(p.title, p.content))} icon={FileIcon} label="DOCX" />
            <ToolbarBtn onClick={() => tryExport(() => printDocument(p.title, p.content))} icon={Printer} label="Print" />
          </div>
        </div>

        {tab === "draft" ? (
          <textarea
            value={p.content}
            onChange={(e) => p.onContentChange(e.target.value)}
            placeholder="Your AI-generated draft will appear here. You can edit it freely."
            className="flex-1 min-h-[55vh] w-full bg-background border border-border rounded-md p-4 font-mono text-[13px] leading-relaxed resize-none"
          />
        ) : (
          <div className="flex-1 min-h-[55vh] w-full bg-background border border-border rounded-md p-6 overflow-auto">
            {p.content ? (
              <pre className="whitespace-pre-wrap font-serif text-[14px] leading-relaxed text-foreground">{p.content}</pre>
            ) : (
              <div className="h-full grid place-items-center text-center text-muted-foreground text-sm">
                <div>
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary/60" />
                  Fill the form and click <span className="text-primary">Generate with AI</span> to draft your document.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarBtn({ icon: Icon, label, onClick, disabled, spin }: { icon: typeof Save; label: string; onClick: () => void; disabled?: boolean; spin?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-border bg-background hover:border-primary/60 hover:text-primary transition-colors disabled:opacity-50"
    >
      <Icon className={`w-3.5 h-3.5 ${spin ? "animate-spin" : ""}`} /> {label}
    </button>
  );
}
