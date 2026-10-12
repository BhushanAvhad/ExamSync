
/**
 * ExamSync Table Component (Section 6)
 * Features:
 * - Semi-transparent glass header with backdrop-filter blur
 * - Sticky header support
 * - Readable typography & comfortable cell spacing
 * - Subtle row separators (no heavy borders)
 * - Row hover & selected states
 * - Responsive container
 */
export function Table({
  columns = [],
  data = [],
  selectedId = null,
  idKey = 'id',
  onRowClick,
  stickyHeader = true,
  emptyMessage = 'No records available',
  ariaLabel = 'Examination Schedule Table',
  className = '',
}) {
  return (
    <div className={`table-wrapper ${className}`.trim()}>
      <table className="table" aria-label={ariaLabel}>
        <thead className={`table-header ${stickyHeader ? 'is-sticky' : ''}`}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="table-th"
                style={{ textAlign: col.align || 'left', width: col.width || 'auto' }}
                scope="col"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="table-td"
                style={{ textAlign: 'center', padding: '36px 18px', color: 'var(--text-muted)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const rowId = row[idKey];
              const isSelected = selectedId === rowId;

              return (
                <tr
                  key={rowId}
                  className={`table-row ${isSelected ? 'table-row-selected' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }}
                  role={onRowClick ? 'button' : undefined}
                  aria-pressed={onRowClick ? isSelected : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="table-td"
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
