import { useState } from "react";
import { useTranslation } from "react-i18next";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import FileDropZone from "@/components/tools/FileDropZone";
import { Button } from "@/components/ui/button";
import {
  detectViewableKind,
  renderDocxHtml,
  renderPdfPages,
  type RenderedPdf,
} from "@/lib/tools/viewDocument";

const VisorDocumentosPage = () => {
  const { t } = useTranslation("tools");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ page: number; total: number } | null>(null);
  const [pdfResult, setPdfResult] = useState<RenderedPdf | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (selected: File) => {
    setError(null);
    setPdfResult(null);
    setDocxHtml(null);
    setImageUrl(null);
    setProgress(null);

    const kind = detectViewableKind(selected);
    if (kind === "unsupported") {
      setError(t("ui.error_unsupported_format"));
      return;
    }

    setFile(selected);
    setLoading(true);
    try {
      if (kind === "pdf") {
        const result = await renderPdfPages(selected, (page, total) => setProgress({ page, total }));
        setPdfResult(result);
      } else if (kind === "docx") {
        const html = await renderDocxHtml(selected);
        setDocxHtml(html);
      } else if (kind === "image") {
        setImageUrl(URL.createObjectURL(selected));
      }
    } catch {
      setError(t("ui.error_generic"));
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPdfResult(null);
    setDocxHtml(null);
    setImageUrl(null);
    setError(null);
    setProgress(null);
  };

  return (
    <ToolPageLayout toolId="visor-documentos">
      {!file ? (
        <div className="border border-neutral-800 rounded-xl p-6 md:p-8">
          <FileDropZone
            accept=".pdf,.docx,application/pdf,image/jpeg,image/png,image/webp"
            label={t("ui.upload_label_view")}
            hint={t("ui.upload_hint_view")}
            onFile={handleFile}
            toolId="visor-documentos"
          />
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm border border-neutral-800 rounded-xl px-4 py-3">
            <span className="text-neutral-400 truncate max-w-[70%]">{file.name}</span>
            <Button
              variant="outline"
              onClick={reset}
              className="rounded-full px-6 border-neutral-700 text-white bg-transparent hover:bg-white/10"
            >
              {t("ui.reset_button_file")}
            </Button>
          </div>

          {loading && (
            <p className="text-neutral-400 text-sm">
              {progress
                ? `${t("ui.rendering_progress")} (${progress.page}/${progress.total})`
                : t("ui.processing")}
            </p>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {pdfResult && (
            <div className="space-y-3">
              {pdfResult.truncated && (
                <p className="text-neutral-500 text-xs">{t("ui.pdf_truncated_notice")}</p>
              )}
              {pdfResult.skippedPages.length > 0 && (
                <p className="text-neutral-500 text-xs">{t("ui.pdf_page_too_large_notice")}</p>
              )}
              {pdfResult.pageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${file.name} - ${i + 1}`}
                  className="w-full rounded-lg border border-neutral-800"
                />
              ))}
            </div>
          )}

          {docxHtml && (
            <div
              className="docx-preview bg-white text-black rounded-lg p-6 md:p-10 overflow-auto"
              dangerouslySetInnerHTML={{ __html: docxHtml }}
            />
          )}

          {imageUrl && (
            <img
              src={imageUrl}
              alt={file.name}
              className="w-full rounded-lg border border-neutral-800"
            />
          )}
        </div>
      )}
    </ToolPageLayout>
  );
};

export default VisorDocumentosPage;
