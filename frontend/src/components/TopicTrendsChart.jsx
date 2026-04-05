import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

// NEW: Added 'loading' prop
const TopicTrendsChart = ({ data, summaryText, onClusterChange, currentClusters, loading }) => {
  const [localClusters, setLocalClusters] = useState(currentClusters);

  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <div style={{ border: '1px solid #eaeaea', padding: '1.5rem', marginBottom: '2rem', borderRadius: '12px', backgroundColor: '#ffffff', textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: '#2c3e50', marginBottom: '10px' }}>Narrative Themes over Time</h2>
        <p style={{ color: '#718096' }}>Not enough data available to generate clusters for this specific query and date range.</p>
      </div>
    );
  }

  const handleApply = () => {
    onClusterChange(localClusters);
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { padding: 20, font: { family: 'sans-serif', size: 12 } } }, tooltip: { mode: 'index', intersect: false } },
    scales: { y: { stacked: true, beginAtZero: true } },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };

  return (
    <div style={{ border: '1px solid #eaeaea', padding: '1.5rem', marginBottom: '2rem', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Narrative Themes over Time</h2>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #edf2f7', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <label style={{ fontWeight: 'bold', color: '#4a5568', fontSize: '14px' }}>Number of Topic Clusters:</label>
          <span style={{ fontWeight: 'bold', color: '#805ad5', fontSize: '15px' }}>{localClusters}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input 
            type="range" min="2" max="8" value={localClusters} 
            onChange={(e) => setLocalClusters(parseInt(e.target.value))}
            style={{ flex: 1, cursor: loading ? 'wait' : 'pointer', accentColor: '#805ad5', opacity: loading ? 0.5 : 1 }}
            disabled={loading} // Prevent dragging while loading
          />
          <button 
            onClick={handleApply}
            disabled={loading} // Prevent clicking while loading
            style={{ padding: '8px 16px', backgroundColor: loading ? '#b794f6' : '#805ad5', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold', transition: '0.2s', width: '130px' }}
          >
            {loading ? 'Processing...' : 'Re-Cluster'}
          </button>
        </div>
      </div>

      <div style={{ height: '350px', width: '100%', position: 'relative', opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
        <Line data={data} options={options} />
      </div>
      
      {summaryText && (
        <p style={{ textAlign: 'left', color: '#2d3748', marginTop: '1.5rem', padding: '1rem', backgroundColor: '#faf5ff', borderRadius: '6px', borderLeft: '4px solid #805ad5', fontSize: '15px', lineHeight: '1.5' }}>
          <strong>AI Analysis:</strong> {summaryText}
        </p>
      )}
    </div>
  );
};

export default TopicTrendsChart;