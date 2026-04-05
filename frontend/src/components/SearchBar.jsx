import React from 'react';

const SearchBar = ({ query, setQuery, startDate, setStartDate, endDate, setEndDate, onSearch, loading }) => {
  const isQueryValid = query.trim().length >= 3;

  return (
    <form onSubmit={onSearch} style={{ marginBottom: '2rem', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search narratives (e.g., 'trump')" 
        style={{ width: '300px', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <label style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>From:</label>
        <input 
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <label style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>To:</label>
        <input 
          type="date" 
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <button 
        type="submit" 
        disabled={loading || !isQueryValid} 
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          cursor: isQueryValid ? 'pointer' : 'not-allowed', 
          borderRadius: '4px', 
          backgroundColor: isQueryValid ? '#007bff' : '#cccccc', 
          color: 'white', 
          border: 'none',
          marginLeft: '10px'
        }}
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

export default SearchBar;