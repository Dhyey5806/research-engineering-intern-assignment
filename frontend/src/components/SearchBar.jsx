import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ query, setQuery, startDate, setStartDate, endDate, setEndDate, onSearch, loading, source }) => {
  const isQueryValid = query.trim().length >= 3;

  return (
    <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[300px]">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
          Intelligence Query
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={source === 'reddit' ? "Search narrative signals (e.g., 'election interference')..." : "Scan global intelligence feeds (e.g., 'crypto fraud')..."}
            className="echo-input pl-10"
          />
        </div>
      </div>

      {source === 'reddit' && (
        <>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="echo-input w-[160px]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="echo-input w-[160px]"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={loading || !isQueryValid}
        className="echo-btn-primary"
      >
        <Search className="w-4 h-4" />
        {loading ? 'Scanning...' : 'Run Analysis'}
      </button>
    </form>
  );
};

export default SearchBar;
