/**
 * ExamSync Spreadsheet & CSV Export Utility
 * Generates RFC-4180 compliant CSVs with UTF-8 BOM (\uFEFF)
 * ensuring seamless compatibility with Microsoft Excel, Google Sheets, and LibreOffice.
 */

export function exportToCSV(filename, columns, rows) {
  if (!rows || rows.length === 0) {
    throw new Error('No data available to export');
  }

  // Header row
  const headerLine = columns
    .map((col) => escapeCSVField(col.label || col.key))
    .join(',');

  // Data rows
  const dataLines = rows.map((row) => {
    return columns
      .map((col) => {
        let val;
        if (typeof col.accessor === 'function') {
          val = col.accessor(row);
        } else if (col.key) {
          val = row[col.key];
        } else {
          val = '';
        }
        return escapeCSVField(val);
      })
      .join(',');
  });

  // UTF-8 BOM (\uFEFF) forces Excel on Windows to interpret file as UTF-8
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('download', cleanFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return cleanFilename;
}

function escapeCSVField(value) {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  // If field contains comma, quote, or newline, escape quotes by doubling them and wrap in quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}
