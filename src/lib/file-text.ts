// Browser-only text extraction helpers.
// PDFs: lazy-load pdfjs-dist. Images: best-effort OCR via tesseract.js.
// Both libraries are loaded on demand to keep the main bundle small.

export async function extractTextFromFile(file: File, onProgress?: (msg: string) => void): Promise<string> {
  const type = file.type;
  if (type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    onProgress?.("Reading PDF…");
    return extractPdf(file);
  }
  if (type.startsWith("image/")) {
    onProgress?.("Running OCR on image…");
    return extractImage(file, onProgress);
  }
  if (type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(file.name)) {
    return file.text();
  }
  throw new Error("Unsupported file type. Upload PDF, image, or text.");
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");
  // Disable worker — runs on main thread (simpler, no separate worker URL needed)
  pdfjs.GlobalWorkerOptions.workerSrc = "//unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs";
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf, disableWorker: true, isEvalSupported: false }).promise;
  let out = "";
  const maxPages = Math.min(doc.numPages, 30);
  for (let i = 1; i <= maxPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((it: any) => it.str).join(" ");
    out += text + "\n\n";
  }
  return out.trim();
}

async function extractImage(file: File, onProgress?: (msg: string) => void): Promise<string> {
  const Tesseract: any = await import("tesseract.js");
  const url = URL.createObjectURL(file);
  try {
    const { data } = await Tesseract.recognize(url, "eng", {
      logger: (m: any) => {
        if (m?.status) onProgress?.(`OCR: ${m.status} ${Math.round((m.progress ?? 0) * 100)}%`);
      },
    });
    return (data?.text ?? "").trim();
  } finally {
    URL.revokeObjectURL(url);
  }
}
