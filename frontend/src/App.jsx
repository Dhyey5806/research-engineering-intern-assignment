import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import TimelineChart from './components/TimelineChart';
import CommunityChart from './components/CommunityChart';
import NetworkGraph from './components/NetworkGraph';
import TopicTrendsChart from './components/TopicTrendsChart';
import { fetchSearchResults, fetchTopicTrends } from './services/api';
import { getTimelineData, getSubredditData } from './utils/dataFormatters';
import ChatBot from './components/ChatBot';

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
    } catch (err) {
      setError("Failed to fetch initial data.");
      console.log(err);
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
    } catch (err) {
      setError("Failed to fetch topic clusters.");
      console.log(err);
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
    } catch (err) {
      setError("Failed to recalculate clusters.");
      console.log(err);
    } finally {
      setTopicsLoading(false);
    }
  };

  const timelineData = getTimelineData(results);
  const subredditData = getSubredditData(results);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '1.5rem' }}>SimPPL Investigative Dashboard</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '8px', padding: '4px' }}>
          <button
            type="button" 
            onClick={() => handleSourceToggle('reddit')}
            style={{ padding: '8px 24px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: source === 'reddit' ? '#ffffff' : 'transparent', color: source === 'reddit' ? '#3182ce' : '#718096', boxShadow: source === 'reddit' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
          >
            Reddit Analysis
          </button>
          <button
            type="button" 
            onClick={() => handleSourceToggle('news')}
            style={{ padding: '8px 24px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: source === 'news' ? '#ffffff' : 'transparent', color: source === 'news' ? '#3182ce' : '#718096', boxShadow: source === 'news' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
          >
            Global News API
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

      {error && <p style={{ color: '#e53e3e', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}
      {warning && (
        <div style={{ backgroundColor: '#fffaf0', color: '#dd6b20', padding: '15px', borderRadius: '8px', border: '1px solid #feebc8', marginBottom: '20px', fontWeight: 'bold' }}>
          [!] {warning}
        </div>
      )}

      {results.length > 0 && !loading && (
        <div>
          <h3 style={{ color: '#555', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            Showing {results.length} semantic matches for "{query}" from {source === 'reddit' ? 'Reddit' : 'Global News'}
          </h3>
          
          <TimelineChart data={timelineData} rawResults={results} summaryText={summaries.timeline} />
          <CommunityChart data={subredditData} summaryText={summaries.community} />
          
          {/* THE FIX: Only render the Network Graph if the source is Reddit */}
          {source === 'reddit' && (
            <NetworkGraph graphData={graphData} summaryText={summaries.network} />
          )}

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
                loading={topicsLoading} 
              />
            )}
          </div>
        </div>
      )}
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