import React, { useState } from 'react';
import './dashboard.css'; // MUST IMPORT HERE
import SearchBar from './components/SearchBar';
import TimelineChart from './components/TimelineChart';
import CommunityChart from './components/CommunityChart';
import NetworkGraph from './components/NetworkGraph';
import TopicTrendsChart from './components/TopicTrendsChart';
import { fetchSearchResults, fetchTopicTrends } from './services/api';
import { getTimelineData, getSubredditData } from './utils/dataFormatters';
import ChatBot from './components/ChatBot';
import './index.css';

function App() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('reddit');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clusterCount, setClusterCount] = useState(4);
  
  const [results, setResults] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [topicData, setTopicData] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [warning, setWarning] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSourceToggle = (newSource) => {
    if (source === newSource) return; 
    setSource(newSource);
    setResults([]);
    setGraphData({ nodes: [], links: [] });
    setTopicData(null);
    setSummaries({});
    setWarning(null);
    setError(null);
    setQuery(''); 
    setStartDate('');
    setEndDate('');
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setWarning(null);
    setTopicData(null); 
    
    try {
      const data = await fetchSearchResults(query, startDate, endDate, 200, source);
      setResults(data.results || []);
      setGraphData(data.graph || { nodes: [], links: [] });
      setSummaries(data.summaries || {});
      setWarning(data.warning || null);
    } catch {
      setError("Failed to establish secure connection to data streams.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadTopics = async () => {
    setTopicsLoading(true);
    try {
      const data = await fetchTopicTrends(query, startDate, endDate, 200, clusterCount, source);
      setTopicData(data.topics);
      setSummaries(prev => ({ ...prev, topics: data.topic_summary }));
    } catch {
      setError("Failed to generate semantic clusters.");
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleClusterChange = async (newClusterCount) => {
    setClusterCount(newClusterCount);
    setTopicsLoading(true);
    try {
      const data = await fetchTopicTrends(query, startDate, endDate, 200, newClusterCount, source);
      setTopicData(data.topics);
      setSummaries(prev => ({ ...prev, topics: data.topic_summary }));
    } catch {
      setError("Failed to recalculate narrative vectors.");
    } finally {
      setTopicsLoading(false);
    }
  };

  const timelineData = getTimelineData(results);
  const subredditData = getSubredditData(results);

  return (
    <div className="dashboard-bg">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="header-title">Narrative-Analyser</h1>
            <p className="header-subtitle">Investigative Intelligence Dashboard</p>
          </div>
          
        </div>
      </header>

      <main className="dashboard-main">
        <div className="toggle-wrapper">
          <div className="toggle-group">
            <button
              type="button" 
              onClick={() => handleSourceToggle('reddit')}
              className={`toggle-btn ${source === 'reddit' ? 'active' : 'inactive'}`}
            >
              Reddit Archive
            </button>
            <button
              type="button" 
              onClick={() => handleSourceToggle('news')}
              className={`toggle-btn ${source === 'news' ? 'active' : 'inactive'}`}
            >
              <div className={`status-dot ${source === 'news' ? '' : 'inactive'}`}></div>
              Global News Analysis
            </button>
          </div>
        </div>

        <SearchBar 
          query={query} 
          setQuery={setQuery} 
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onSearch={handleSearch} 
          loading={loading} 
          source={source} 
        />

        {error && <div className="error-banner">{error}</div>}
        {warning && <div className="warning-banner">⚠️ {warning}</div>}

        {results.length > 0 && !loading && (
          <div>
            <div className="report-header">
              <h3 className="report-title">
                Intelligence Report: <span style={{ color: '#0f172a' }}>"{query}"</span>
              </h3>
              <span className="report-subtitle">Analyzed {results.length} contextual matches via {source === 'reddit' ? 'Reddit' : 'Global News Stream'}</span>
            </div>
            
            <TimelineChart data={timelineData} rawResults={results} summaryText={summaries.timeline} />
            <CommunityChart data={subredditData} summaryText={summaries.community} />
            
            {source === 'reddit' && (
              <NetworkGraph graphData={graphData} summaryText={summaries.network} />
            )}

            <div className="ml-section">
              {!topicData ? (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <div className="ml-icon-box">🧠</div>
                  <h3 className="ml-title">Deep Semantic Analysis</h3>
                  <p className="ml-desc">Deploy machine learning models to cluster unstructured data, extracting hidden narrative vectors and linguistic patterns from the raw text.</p>
                  <button 
                    onClick={handleLoadTopics}
                    disabled={topicsLoading}
                    className="ml-btn"
                  >
                    {topicsLoading ? 'Processing High-Dimensional Clusters...' : 'Extract Narrative Embeddings'}
                  </button>
                </div>
              ) : (
                <TopicTrendsChart 
                  data={topicData} 
                  summaryText={summaries.topics} 
                  onClusterChange={handleClusterChange}
                  currentClusters={clusterCount}
                  loading={topicsLoading} 
                />
              )}
            </div>
          </div>
        )}
      </main>
      
      {results.length > 0 && !loading && (
        <ChatBot 
          rawResults={results} 
          timelineData={timelineData}
          subredditData={subredditData}
          graphData={graphData}
          topicData={topicData}
        />
      )}
    </div>
  );
}

export default App;