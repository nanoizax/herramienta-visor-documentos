import pdfjsLib from "./pdfjs";

export type ViewableKind = "pdf" | "docx" | "image" | "unsupported";

export function detectViewableKind(file: File): ViewableKind {
  const lower = file.name.toLowerCase();
  if (file.type === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  if (file.type.startsWith("image/")) return "image";
  return "unsupported";
}

const MAX_PDF_PAGES_RENDERED = 40; // tope para no colgar el navegador con un PDF gigante
const VIEW_TARGET_MEGAPIXELS = 3; // suficiente nitidez en pantalla, sin renders enormes
const RENDER_TIMEOUT_MS = 15_000; // red de seguridad: si una pagina no renderiza en este tiempo, se salta

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export interface RenderedPdf {
  pageUrls: string[];
  totalPages: number;
  truncated: boolean;
  skippedPages: number[];
}

/** Renderiza cada pagina del PDF como imagen para mostrarla en el visor. */
export async function renderPdfPages(
  file: File,
  onProgress?: (page: number, total: number) => void
): Promise<RenderedPdf> {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pagesToRender = Math.min(pdf.numPages, MAX_PDF_PAGES_RENDERED);
  const pageUrls: string[] = [];
  const skippedPages: number[] = [];

  for (let i = 1; i <= pagesToRender; i++) {
    onProgress?.(i, pagesToRender);

    const page = await pdf.getPage(i);
    // Pedir el contenido de texto antes de renderizar fuerza a pdf.js a
    // terminar de resolver el stream de la pagina primero -sin este paso,
    // page.render() puede quedarse esperando para siempre en paginas con
    // contenido fuente muy pesado (visto con un PDF real de 135MB).
    await page.getTextContent();

    const baseViewport = page.getViewport({ scale: 1 });
    const nativeMegapixels = (baseViewport.width * baseViewport.height) / 1_000_000;

    const scale = Math.min(Math.sqrt(VIEW_TARGET_MEGAPIXELS / nativeMegapixels), 1);
    const viewport = page.getViewport({ scale: Math.max(scale, 0.2) });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo crear el contexto de canvas");

    try {
      await withTimeout(page.render({ canvasContext: ctx, viewport }).promise, RENDER_TIMEOUT_MS);
    } catch {
      skippedPages.push(i);
      continue;
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen"))),
        "image/jpeg",
        0.85
      );
    });
    pageUrls.push(URL.createObjectURL(blob));
  }

  return {
    pageUrls,
    totalPages: pdf.numPages,
    truncated: pdf.numPages > pagesToRender,
    skippedPages,
  };
}

// Esquemas que, al hacer clic, ejecutan codigo en vez de navegar.
const SCRIPT_URL_SCHEMES = ["javascript:", "vbscript:", "data:"];

/** true si el destino del enlace ejecutaria codigo en la pagina al hacer clic. */
export function isScriptUrl(href: string): boolean {
  // Misma normalizacion que hace el navegador: quita tabs y saltos de linea en
  // cualquier posicion, y espacios o caracteres de control al principio.
  const normalized = href.replace(/[\t\n\r]/g, "").replace(/^[\u0000- ]+/, "").toLowerCase();
  if (SCRIPT_URL_SCHEMES.some((scheme) => normalized.startsWith(scheme))) return true;
  try {
    return SCRIPT_URL_SCHEMES.includes(new URL(href, "https://sonholab.com/").protocol);
  } catch {
    return false;
  }
}

type DocxNode = { type?: string; href?: string; anchor?: string; children?: unknown[] };

/**
 * Quita los hipervinculos con destino ejecutable (javascript: y similares) y deja
 * su texto. Recorre el documento entero, no solo `children`: las notas al pie
 * (`body`) y los comentarios cuelgan fuera de ese arbol y tambien se convierten.
 */
export function stripScriptLinks<T>(document: T): T {
  const seen = new Set<object>();
  const visit = (value: unknown): void => {
    if (!value || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const node = value[i] as DocxNode | null;
        if (node?.type === "hyperlink" && !node.anchor && node.href && isScriptUrl(node.href)) {
          value.splice(i, 1, ...(node.children ?? []));
          i--; // revisar los hijos que ocuparon su lugar
          continue;
        }
        visit(node);
      }
      return;
    }
    Object.values(value).forEach(visit);
  };
  visit(document);
  return document;
}

/** Word (.docx) -> HTML con el formato preservado (titulos, negritas, listas, tablas). */
export async function renderDocxHtml(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      // El .docx puede traer su propio mapa de estilos, capaz de emitir cualquier
      // etiqueta o atributo (onerror, href=javascript:...). Solo se usa el de mammoth.
      includeEmbeddedStyleMap: false,
      transformDocument: stripScriptLinks,
    }
  );
  return html;
}
