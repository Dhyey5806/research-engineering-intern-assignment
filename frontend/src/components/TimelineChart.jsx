import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const TimelineChart = ({ data, rawResults, summaryText }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Number of Posts',
        data: data.values,
        fill: true,
        backgroundColor: 'rgba(136, 132, 216, 0.3)',
        borderColor: '#8884d8',
        tension: 0.3,
        pointBackgroundColor: '#8884d8',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#8884d8',
        pointHoverBorderWidth: 3,
        pointRadius: 4,
        pointHitRadius: 10
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        callbacks: {
          footer: () => 'Click point to view posts'
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const dateStr = data.labels[index];
        setSelectedDate(dateStr);
      }
    },
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
    }
  };

  // The 1-to-1 Synchronized Date Filter
  const filteredPosts = selectedDate && rawResults
    ? rawResults.filter(post => {
        if (!post.date) return false;
        try {
          // Applies the exact same formatting logic used to build the X-axis labels
          const postDateStr = new Date(post.date).toISOString().split('T')[0];
          return postDateStr === selectedDate;
        } catch (e) {
          return false;
        }
      })
    : [];

  return (
    <div style={{ border: '1px solid #eee', padding: '1.5rem', marginBottom: '2rem', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)', position: 'relative' }}>
      <h2 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Narrative Volume over Time</h2>

      {!selectedDate ? (
        <>
          <div style={{ height: '300px', width: '100%', position: 'relative' }}>
            <Line data={chartData} options={options} />
          </div>
          <p style={{ fontSize: '13px', color: '#718096', textAlign: 'center', marginTop: '10px', fontStyle: 'italic' }}>
            * Click on any point in the graph to read the exact posts from that timeframe.
          </p>
          {summaryText && (
            <p style={{ color: '#2d3748', marginTop: '1.5rem', padding: '1rem', backgroundColor: '#ebf8ff', borderRadius: '6px', borderLeft: '4px solid #3182ce', fontSize: '15px', lineHeight: '1.5' }}>
              <strong>AI Analysis:</strong> {summaryText}
            </p>
          )}
        </>
      ) : (
        <div style={{ height: 'auto', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, color: '#2b6cb0' }}>Posts from {selectedDate} ({filteredPosts.length})</h3>
            <button
              onClick={() => setSelectedDate(null)}
              style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
            >
              ✕ Close & Return to Chart
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', paddingRight: '10px' }}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, idx) => (
                <div key={idx} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #edf2f7' }}>
                  <div style={{ fontWeight: 'bold', color: '#2d3748', marginBottom: '8px', fontSize: '15px' }}>
                    Username: <span style={{ color: '#3182ce' }}>{post.author || 'Anonymous'}</span>
                  </div>
                  <div style={{ color: '#4a5568', fontSize: '14px', lineHeight: '1.5' }}>
                    <strong>Post:</strong> {post.title || ''}
                    {post.selftext && post.selftext !== 'None' && post.selftext !== 'null' && (
                      <span style={{ display: 'block', marginTop: '6px', color: '#718096' }}>
                        {post.selftext}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#718096', textAlign: 'center', marginTop: '3rem', fontStyle: 'italic' }}>
                No readable post data found for this specific timestamp.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineChart;