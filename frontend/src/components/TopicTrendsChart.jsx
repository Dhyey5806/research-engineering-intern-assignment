import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const TopicTrendsChart = ({ data, summaryText, onClusterChange, currentClusters, loading }) => {
  const [localClusters, setLocalClusters] = useState(currentClusters);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'map'

  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <div style={{ border: '1px solid #eaeaea', padding: '1.5rem', marginBottom: '2rem', borderRadius: '12px', backgroundColor: '#ffffff', textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: '#2c3e50', marginBottom: '10px' }}>Narrative Themes & Embeddings</h2>
        <p style={{ color: '#718096' }}>Not enough data available to generate clusters.</p>
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
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Narrative Themes & Embeddings</h2>
        
        {/* VIEW TOGGLE */}
        <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => setViewMode('chart')}
            style={{ padding: '6px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: viewMode === 'chart' ? '#ffffff' : 'transparent', color: viewMode === 'chart' ? '#3182ce' : '#718096', boxShadow: viewMode === 'chart' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s', fontSize: '13px' }}
          >
            Volume Timeline
          </button>
          <button
            onClick={() => setViewMode('map')}
            style={{ padding: '6px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: viewMode === 'map' ? '#ffffff' : 'transparent', color: viewMode === 'map' ? '#3182ce' : '#718096', boxShadow: viewMode === 'map' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s', fontSize: '13px' }}
          >
            Datamapplot (UMAP)
          </button>
        </div>
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
            disabled={loading} 
          />
          <button 
            onClick={handleApply}
            disabled={loading} 
            style={{ padding: '8px 16px', backgroundColor: loading ? '#b794f6' : '#805ad5', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold', transition: '0.2s', width: '130px' }}
          >
            {loading ? 'Processing...' : 'Re-Cluster'}
          </button>
        </div>
      </div>

      {/* RENDER THE SELECTED VIEW */}
      <div style={{ height: '500px', width: '100%', position: 'relative', opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
        {viewMode === 'chart' ? (
          <Line data={data} options={options} />
        ) : (
          data.datamap_html ? (
            <iframe 
              srcDoc={data.datamap_html} 
              style={{ width: '100%', height: '100%', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              title="Datamapplot Embeddings"
            />
          ) : (
             <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#718096', backgroundColor: '#f8f9fa', border: '1px dashed #cbd5e0', borderRadius: '8px' }}>
               No embedding data available.
             </div>
          )
        )}
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