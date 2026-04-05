import React from 'react';

const SearchBar = ({ query, setQuery, startDate, setStartDate, endDate, setEndDate, onSearch, loading, source }) => {
  const isQueryValid = query.trim().length >= 3;

  return (
    <form onSubmit={onSearch} style={{ marginBottom: '2rem', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={source === 'reddit' ? "Search Reddit narratives (e.g., 'trump')..." : "Search Global News (e.g., 'crypto scam')..."} 
        style={{ width: '350px', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
      />
      
      {/* Hide the date filters if the source is NewsAPI */}
      {source === 'reddit' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>From:</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '9px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>To:</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '9px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
        </>
      )}

      <button 
        type="submit" 
        disabled={loading || !isQueryValid} 
        style={{ 
          padding: '10px 24px', 
          fontSize: '16px', 
          cursor: isQueryValid ? 'pointer' : 'not-allowed', 
          borderRadius: '6px', 
          backgroundColor: isQueryValid ? '#3182ce' : '#cccccc', 
          color: 'white', 
          border: 'none',
          marginLeft: '10px',
          fontWeight: 'bold',
          transition: '0.2s'
        }}
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

export default SearchBar;