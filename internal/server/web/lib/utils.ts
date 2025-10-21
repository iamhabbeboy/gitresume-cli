import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Technology } from "../src/pages/projects/type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const prependTailwindHTMLForExport = (contentHtml: string) => {
  return `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
    <style>
    @media print {
      .resume-container {
        page-break-after: always;
      }
    }
    @page {
      size: A4;
      margin: 0;
    }
    body {
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    }
    .resume-container {
      width: 210mm;
      min-height: 297mm;
      padding: 0mm 10mm;
      background: white;
      box-sizing: border-box;
    }
    .no-break {
      page-break-inside: avoid;
    }
      /* Force list styles to render in PDF */
    ul {
      list-style-type: disc !important;
      list-style-position: outside !important;
      padding-left: 1.5rem !important;
    }
    
    ul li {
      display: list-item !important;
      padding-left: 0.25rem;
    }
    
    /* For nested lists */
    ul ul {
      list-style-type: circle !important;
      margin-top: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="resume-container">
    ${contentHtml}
  </div>
</body>
</html>`;
};

const decodeTechnology = (tech: string) => {
  const raw = tech?.trim();
  if (!raw) return {} as Technology;

  try {
    return JSON.parse(raw) as Technology;
  } catch (err) {
    console.warn("Invalid technologies JSON:", err);
    return {} as Technology;
  }
};

export const transformTech = (value: string) => {
  const obj = decodeTechnology(value);
  const hasTech = Object.keys(obj).length > 0;

  const stack = hasTech ? Object.keys(obj.stack ?? {}) : [];
  const framework = hasTech ? Object.keys(obj.framework ?? {}) : [];

  return Array.from(new Set([...stack, ...framework]));
};
