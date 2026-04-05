import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { Layers, Map, BarChart2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const TopicTrendsChart = ({ data, summaryText, onClusterChange, currentClusters, loading }) => {
  const [localClusters, setLocalClusters] = useState(currentClusters);
  const [viewMode, setViewMode] = useState('chart');

  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <div className="echo-card animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-emerald-500" />
          <h2 className="echo-section-title">Narrative Themes & Embeddings</h2>
        </div>
        <p className="echo-section-subtitle mt-2">
          Insufficient data to generate semantic clusters.
        </p>
      </div>
    );
  }

  const handleApply = () => {
    onClusterChange(localClusters);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'hsl(222, 47%, 11%)',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 11 },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: 'hsla(214, 32%, 91%, 0.5)' },
        ticks: { font: { family: 'Inter', size: 11 }, color: 'hsl(215, 16%, 47%)' }
      },
      x: {
        grid: { color: 'hsla(214, 32%, 91%, 0.5)' },
        ticks: { font: { family: 'Inter', size: 11 }, color: 'hsl(215, 16%, 47%)' }
      }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };

  return (
    <div className="echo-card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-500" />
          <h2 className="echo-section-title">Narrative Themes & Embeddings</h2>
        </div>

        <div className="echo-toggle-group">
          <button
            onClick={() => setViewMode('chart')}
            className={viewMode === 'chart' ? 'echo-toggle-btn-active' : 'echo-toggle-btn'}
          >
            <BarChart2 className="w-3.5 h-3.5 inline mr-1" />
            Volume Timeline
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={viewMode === 'map' ? 'echo-toggle-btn-active' : 'echo-toggle-btn'}
          >
            <Map className="w-3.5 h-3.5 inline mr-1" />
            UMAP Projection
          </button>
        </div>
      </div>

      {/* Semantic Resolution Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground font-medium">Semantic Resolution:</span>
          <span className="font-mono text-foreground font-semibold">{localClusters}</span>
        </div>
        <input
          type="range"
          min="2"
          max="10"
          value={localClusters}
          onChange={(e) => setLocalClusters(parseInt(e.target.value))}
          className="flex-1 min-w-[120px] accent-emerald-500"
          style={{ opacity: loading ? 0.5 : 1 }}
          disabled={loading}
        />
        <button
          onClick={handleApply}
          disabled={loading}
          className="echo-btn-accent text-xs"
        >
          {loading ? 'Processing...' : 'Re-Cluster'}
        </button>
      </div>

      {/* Summaries */}
      {summaryText && (
        <div className="mb-4 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="echo-ai-badge">✦ AI Analysis</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{summaryText}</p>
        </div>
      )}

      <div style={{ height: '400px' }}>
        {viewMode === 'chart' ? (
          <Line data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full rounded-lg bg-muted/20 border border-border">
            <div className="text-center">
              <Map className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">UMAP Embedding Visualization</p>
              <p className="text-xs text-muted-foreground mt-1">Requires backend datamapplot rendering</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicTrendsChart;
