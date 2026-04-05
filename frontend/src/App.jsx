import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import TimelineChart from './components/TimelineChart';
import CommunityChart from './components/CommunityChart';
import NetworkGraph from './components/NetworkGraph';
import TopicTrendsChart from './components/TopicTrendsChart';
import { fetchSearchResults, fetchTopicTrends } from './services/api';
import { getTimelineData, getSubredditData } from './utils/dataFormatters';

function App() {
  const [query, setQuery] = useState('');
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

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWarning(null);
    setTopicData(null); 
    
    try {
      const data = await fetchSearchResults(query, startDate, endDate, 200);
      setResults(data.results);
      setGraphData(data.graph);
      setSummaries(data.summaries || {});
      setWarning(data.warning || null);
    } catch (err) {
      setError("Failed to fetch initial data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadTopics = async () => {
    setTopicsLoading(true);
    try {
      const data = await fetchTopicTrends(query, startDate, endDate, 200, clusterCount);
      setTopicData(data.topics);
      setSummaries(prev => ({ ...prev, topics: data.topic_summary }));
    } catch (err) {
      setError("Failed to fetch topic clusters.");
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleClusterChange = async (newClusterCount) => {
    setClusterCount(newClusterCount);
    setTopicsLoading(true);
    try {
      const data = await fetchTopicTrends(query, startDate, endDate, 200, newClusterCount);
      setTopicData(data.topics);
      setSummaries(prev => ({ ...prev, topics: data.topic_summary }));
    } catch (err) {
      setError("Failed to recalculate clusters.");
    } finally {
      setTopicsLoading(false);
    }
  };

  const timelineData = getTimelineData(results);
  const subredditData = getSubredditData(results);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333' }}>SimPPL Investigative Dashboard</h1>
      
      <SearchBar 
        query={query} 
        setQuery={setQuery} 
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onSearch={handleSearch} 
        loading={loading} 
      />

      {error && <p style={{ color: '#e53e3e', fontWeight: 'bold' }}>{error}</p>}
      {warning && (
        <div style={{ backgroundColor: '#fffaf0', color: '#dd6b20', padding: '15px', borderRadius: '8px', border: '1px solid #feebc8', marginBottom: '20px', fontWeight: 'bold' }}>
          [!] {warning}
        </div>
      )}

      {results.length > 0 && !loading && (
        <div>
          <h3 style={{ color: '#555', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            Showing {results.length} semantic matches for "{query}"
          </h3>
          
          <TimelineChart data={timelineData} summaryText={summaries.timeline} />
          <CommunityChart data={subredditData} summaryText={summaries.community} />
          <NetworkGraph graphData={graphData} summaryText={summaries.network} />

          <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            {!topicData ? (
              <>
                <h3 style={{ marginTop: 0, color: '#2d3748' }}>Deep Narrative Analysis</h3>
                <p style={{ color: '#718096', marginBottom: '20px' }}>Run the machine learning clustering algorithm to discover hidden themes within these search results.</p>
                <button 
                  onClick={handleLoadTopics}
                  disabled={topicsLoading}
                  style={{ padding: '12px 24px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: topicsLoading ? 'wait' : 'pointer' }}
                >
                  {topicsLoading ? 'Processing Clusters & AI Analysis...' : 'Showcase Narrative Themes over time'}
                </button>
              </>
            ) : (
              <TopicTrendsChart 
                data={topicData} 
                summaryText={summaries.topics} 
                onClusterChange={handleClusterChange}
                currentClusters={clusterCount}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;