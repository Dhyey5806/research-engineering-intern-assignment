import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';
import { TrendingUp, X, User, FileText } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const TimelineChart = ({ data, rawResults, summaryText }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Signal Volume',
        data: data.values,
        fill: true,
        backgroundColor: 'hsla(160, 84%, 39%, 0.08)',
        borderColor: 'hsl(160, 84%, 39%)',
        tension: 0.4,
        pointBackgroundColor: 'hsl(160, 84%, 39%)',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: 'hsl(160, 84%, 39%)',
        pointHoverBorderWidth: 3,
        pointRadius: 3,
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
        backgroundColor: 'hsl(222, 47%, 11%)',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 11 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          footer: () => 'Click to inspect signals'
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'hsla(214, 32%, 91%, 0.5)' },
        ticks: { font: { family: 'Inter', size: 11 }, color: 'hsl(215, 16%, 47%)' }
      },
      y: {
        grid: { color: 'hsla(214, 32%, 91%, 0.5)' },
        ticks: { font: { family: 'Inter', size: 11 }, color: 'hsl(215, 16%, 47%)' }
      }
    },
    onClick: (_event, elements) => {
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

  const filteredPosts = selectedDate && rawResults
    ? rawResults.filter(post => {
        if (!post.date) return false;
        try {
          const postDateStr = new Date(post.date).toISOString().split('T')[0];
          return postDateStr === selectedDate;
        } catch {
          return false;
        }
      })
    : [];

  return (
    <div className="echo-card animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        <h2 className="echo-section-title">Narrative Volume Over Time</h2>
      </div>

      {!selectedDate ? (
        <>
          <div style={{ height: '320px' }} className="mt-4">
            <Line data={chartData} options={options} />
          </div>
          <p className="echo-section-subtitle mt-3 flex items-center gap-1.5">
            <span className="echo-badge-slate">Tip</span>
            Click any data point to drill into individual signals from that timeframe.
          </p>
          {summaryText && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="echo-ai-badge">✦ AI Analysis</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{summaryText}</p>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">
              Signals from {selectedDate}
              <span className="echo-badge-emerald ml-2">{filteredPosts.length} results</span>
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="echo-btn-secondary text-xs"
            >
              <X className="w-3.5 h-3.5" />
              Return to Chart
            </button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {post.author || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{post.title || ''}</p>
                      {post.selftext && post.selftext !== 'None' && post.selftext !== 'null' && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{post.selftext}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No readable signal data found for this timestamp.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineChart;
