import { SearchIcon, XIcon } from '../ui/Icons';

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [], // Array of { id, value, onChange, options: [{ label, value }], ariaLabel }
  totalResults,
  onClearAll,
}) {
  const hasActiveFilters = searchQuery || filters.some((f) => f.value && f.value !== 'all');

  return (
    <div className="admin-filter-bar">
      <div className="filter-bar-left">
        <div className="filter-search-box">
          <SearchIcon size={16} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={searchPlaceholder}
          />
          {searchQuery && (
            <button
              type="button"
              className="filter-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>

        {filters.map((filter) => (
          <div key={filter.id} className="filter-select-wrapper">
            <select
              className="filter-select"
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              aria-label={filter.ariaLabel || filter.id}
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {hasActiveFilters && onClearAll && (
          <button
            type="button"
            className="filter-reset-link"
            onClick={onClearAll}
          >
            Reset Filters
          </button>
        )}
      </div>

      {typeof totalResults !== 'undefined' && (
        <div className="filter-bar-right">
          <span className="filter-results-count">
            {totalResults} {totalResults === 1 ? 'record' : 'records'} found
          </span>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
