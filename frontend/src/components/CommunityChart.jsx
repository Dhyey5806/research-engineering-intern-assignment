import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const CommunityChart = ({ data, summaryText }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Total Engagement',
        data: data.values,
        backgroundColor: '#82ca9d',
      }
    ]
  };

  const options = {
    indexAxis: 'y', 
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div style={{ border: '1px solid #eee', padding: '1rem', marginBottom: '2rem', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
      <h2>Top Communities by Engagement</h2>
      <div style={{ height: '300px', width: '100%', position: 'relative' }}>
        <Bar data={chartData} options={options} />
      </div>
      {summaryText && (
        <p style={{ color: '#2d3748', marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0fff4', borderRadius: '6px', borderLeft: '4px solid #48bb78', fontSize: '15px', lineHeight: '1.5' }}>
          <strong>AI Analysis:</strong> {summaryText}
        </p>
      )}
    </div>
  );
};

export default CommunityChart;