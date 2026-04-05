import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import { BarChart3 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const CommunityChart = ({ data, summaryText }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Total Engagement',
        data: data.values,
        backgroundColor: 'hsl(160, 84%, 39%)',
        borderRadius: 6,
        barThickness: 20,
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'hsl(222, 47%, 11%)',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 11 },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { color: 'hsla(214, 32%, 91%, 0.5)' },
        ticks: { font: { family: 'Inter', size: 11 }, color: 'hsl(215, 16%, 47%)' }
      },
      y: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11, weight: 'bold' }, color: 'hsl(222, 47%, 11%)' }
      }
    }
  };

  return (
    <div className="echo-card animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="w-5 h-5 text-emerald-500" />
        <h2 className="echo-section-title">Top Communities by Engagement</h2>
      </div>
      <p className="echo-section-subtitle mb-4">Ranked by combined score and comment volume.</p>

      {summaryText && (
        <div className="mb-4 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="echo-ai-badge">✦ AI Analysis</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{summaryText}</p>
        </div>
      )}

      <div style={{ height: `${Math.max(200, data.labels.length * 36)}px` }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CommunityChart;
