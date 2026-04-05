import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const TimelineChart = ({ data, summaryText }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Number of Posts',
        data: data.values,
        fill: true,
        backgroundColor: 'rgba(136, 132, 216, 0.3)',
        borderColor: '#8884d8',
        tension: 0.3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  return (
    <div style={{ border: '1px solid #eee', padding: '1.5rem', marginBottom: '2rem', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
      <h2 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Narrative Volume over Time</h2>
      <div style={{ height: '300px', width: '100%', position: 'relative' }}>
        <Line data={chartData} options={options} />
      </div>
      {summaryText && (
        <p style={{ color: '#2d3748', marginTop: '1.5rem', padding: '1rem', backgroundColor: '#ebf8ff', borderRadius: '6px', borderLeft: '4px solid #3182ce', fontSize: '15px', lineHeight: '1.5' }}>
          <strong>AI Analysis:</strong> {summaryText}
        </p>
      )}
    </div>
  );
};

export default TimelineChart;