import { Table } from '../ui/Table';
import { ChevronLeftIcon, ChevronRightIcon, LayersIcon } from '../ui/Icons';

export function DataTable({
  columns = [],
  data = [],
  selectedId = null,
  idKey = 'id',
  onRowClick,
  emptyTitle = 'No records found',
  emptySubtitle = 'Try adjusting your search criteria or filters.',
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  totalItems,
  className = '',
}) {
  const total = typeof totalItems === 'number' ? totalItems : data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // If client-side slicing is needed when onPageChange is provided without external pagination
  const startIndex = (currentPage - 1) * pageSize;
  const displayData = data.length > pageSize ? data.slice(startIndex, startIndex + pageSize) : data;

  return (
    <div className={`admin-data-table-container ${className}`.trim()}>
      <Table
        columns={columns}
        data={displayData}
        selectedId={selectedId}
        idKey={idKey}
        onRowClick={onRowClick}
        stickyHeader={true}
        emptyMessage={
          <div className="table-empty-state">
            <div className="table-empty-icon">
              <LayersIcon size={28} />
            </div>
            <div className="table-empty-title">{emptyTitle}</div>
            <div className="table-empty-subtitle">{emptySubtitle}</div>
          </div>
        }
      />

      {total > 0 && (
        <div className="admin-table-pagination">
          <div className="pagination-info">
            Showing{' '}
            <span className="pagination-highlight">
              {Math.min(startIndex + 1, total)}–{Math.min(startIndex + displayData.length, total)}
            </span>{' '}
            of <span className="pagination-highlight">{total}</span> entries
          </div>

          {totalPages > 1 && onPageChange && (
            <div className="pagination-controls">
              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeftIcon size={14} />
                <span>Prev</span>
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`pagination-page-btn ${currentPage === page ? 'is-active' : ''}`}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRightIcon size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;
