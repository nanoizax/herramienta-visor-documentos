import * as pdfjsLib from "pdfjs-dist";
// eslint-disable-next-line import/no-unresolved
import PdfWorker from "pdfjs-dist/build/pdf.worker.mjs?worker";

// workerPort (en vez de workerSrc) le da a pdf.js una instancia de Worker ya
// creada por Vite -evita depender de que la URL resuelva bien en runtime,
// que colgaba getDocument() sin tirar error.
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

export default pdfjsLib;
