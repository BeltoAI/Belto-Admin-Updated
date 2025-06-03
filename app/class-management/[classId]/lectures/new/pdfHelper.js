import * as pdfjs from 'pdfjs-dist';
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs';

// Configure the worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerPort = new Worker(
    new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url)
  );
} else {
  // Node.js environment
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export { pdfjs };