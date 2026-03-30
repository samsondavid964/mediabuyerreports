/**
 * Export an array of objects as a CSV file download.
 * @param {Object[]} rows - Data rows
 * @param {string[]} columns - Column keys in order
 * @param {Object} headers - Map of column key → display header
 * @param {string} filename - Download filename
 */
export function exportCsv(rows, columns, headers, filename = 'export.csv') {
  if (!rows.length) return

  const escape = (val) => {
    const str = String(val ?? '').replace(/"/g, '""')
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str}"`
      : str
  }

  const headerRow = columns.map((col) => escape(headers[col] || col)).join(',')
  const dataRows = rows.map((row) =>
    columns.map((col) => escape(row[col])).join(',')
  )
  const csv = [headerRow, ...dataRows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
