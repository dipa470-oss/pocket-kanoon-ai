import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import pkg from "file-saver";
const { saveAs } = pkg;

function safeName(name: string) {
  return name.replace(/[^a-z0-9-_]+/gi, "_").slice(0, 80) || "document";
}

export function exportPDF(title: string, content: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 50;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text(title, margin, margin);

  doc.setFont("times", "normal");
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(content, width);
  let y = margin + 28;
  const lineHeight = 15;
  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  doc.save(`${safeName(title)}.pdf`);
}

export async function exportDOCX(title: string, content: string) {
  const paragraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: title, bold: true, size: 32 })],
      spacing: { after: 300 },
    }),
    ...content.split(/\n/).map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line || " ", size: 22 })],
          spacing: { after: 120 },
        }),
    ),
  ];

  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${safeName(title)}.docx`);
}

export function printDocument(title: string, content: string) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>${title}</title>
    <style>
      body { font-family: 'Times New Roman', Georgia, serif; padding: 48px; line-height: 1.6; color:#111; }
      h1 { text-align:center; font-size: 20px; margin-bottom: 24px; }
      pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; }
    </style></head><body>
    <h1>${title.replace(/[<>]/g, "")}</h1>
    <pre>${content.replace(/[<>]/g, (c) => (c === "<" ? "&lt;" : "&gt;"))}</pre>
    <script>window.onload = () => { window.print(); }</script>
    </body></html>`);
  w.document.close();
}
