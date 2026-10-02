/**
 * RFC 4180-compliant CSV generator and client-side download utility.
 */

export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  // If the cell contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface CsvColumn<T> {
  header: string;
  key: keyof T | ((row: T) => unknown);
}

export function generateCsv<T>(
  columns: CsvColumn<T>[],
  data: T[]
): string {
  const headerLine = columns.map((col) => escapeCsvCell(col.header)).join(",");
  const dataLines = data.map((row) =>
    columns
      .map((col) => {
        const value = typeof col.key === "function" ? col.key(row) : (row as Record<string, unknown>)[col.key as string];
        return escapeCsvCell(value);
      })
      .join(",")
  );

  return [headerLine, ...dataLines].join("\r\n");
}

export function downloadCsvInBrowser(filename: string, csvContent: string): void {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
