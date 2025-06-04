// Utility to generate CSV from array of objects or arrays
export function arrayToCSV(rows: any[], columns?: string[]): string {
  if (!rows.length) return '';
  const cols = columns || Object.keys(rows[0]);
  const header = cols.join(',');
  const csvRows = rows.map(row =>
    cols.map(col => {
      let val = row[col] ?? '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n')))
        val = '"' + val.replace(/"/g, '""') + '"';
      return val;
    }).join(',')
  );
  return [header, ...csvRows].join('\r\n');
}

export function downloadCSV(csv: string, filename = 'data.csv') {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
