// generate the string contents of the TSV
function getTSVContent<T extends Record<string, any>>(
  headers: string[],
  rowKeys: (keyof T)[],
  rows: T[]
): string {
  if (rows.length === 0) return "";
  const header = headers.join("\t");
  const dataRows = rows.map((row) =>
    rowKeys.map((key) => String(row[key] ?? "")).join("\t")
  );
  const tsvContent = [header, ...dataRows].join("\n");
  return tsvContent;
}

// download the TSV from provided contents
export function downloadTSV(filename: string, tsvContent: string) {
  const blob = new Blob([tsvContent], { type: "text/tab-separated-values" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// create contents + download TSV
export function generateTSV<T extends Record<string, any>>(
  filename: string,
  headers: string[],
  rowKeys: (keyof T)[],
  rows: T[]
): void {
  const tsvContent = getTSVContent(headers, rowKeys, rows);
  downloadTSV(filename, tsvContent);
}
