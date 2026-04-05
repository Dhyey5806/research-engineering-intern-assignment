import React, { useState, useMemo, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NetworkGraph = ({ graphData }) => {
  const [showRankings, setShowRankings] = useState(false);
  const [hiddenNodes, setHiddenNodes] = useState(new Set());
  const fgRef = useRef();

  const displayData = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], links: [] };
    
    // THE FIX: Re-applied the hiddenNodes filter so clicking actually deletes them from the screen
    const visibleNodes = graphData.nodes.filter(n => !hiddenNodes.has(n.id));
    const visibleLinks = graphData.links.filter(
      l => {
        const sourceId = l.source.id || l.source;
        const targetId = l.target.id || l.target;
        return !hiddenNodes.has(sourceId) && !hiddenNodes.has(targetId);
      }
    );
    
    return { nodes: visibleNodes, links: visibleLinks };
  }, [graphData, hiddenNodes]);

  useEffect(() => {
    if (fgRef.current && displayData.nodes.length > 0) {
      fgRef.current.d3Force('charge').strength(-80); 
      fgRef.current.d3Force('link').distance(40);     
      fgRef.current.d3Force('center').strength(1);

      setTimeout(() => {
        fgRef.current?.zoomToFit(400, 50); 
      }, 800);
    }
  }, [displayData]);

  const handleNodeClick = (node) => {
    const newHidden = new Set(hiddenNodes);
    newHidden.add(node.id);
    setHiddenNodes(newHidden);
  };

  const handleReset = () => {
    setHiddenNodes(new Set()); // This brings all deleted nodes back
    setTimeout(() => {
      fgRef.current?.zoomToFit(400, 50);
    }, 100);
  };

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div style={{ border: '1px solid #eee', padding: '1.5rem', marginBottom: '2rem', borderRadius: '8px', backgroundColor: '#fff' }}>
        <h2 style={{ marginTop: 0 }}>Influence Network</h2>
        <p style={{ color: '#666' }}>No cross-community bridges found in the top 4000 posts.</p>
      </div>
    );
  }

  const rankedAuthors = displayData.nodes
    .filter(n => n.group === 'author')
    .sort((a, b) => b.val - a.val);

  return (
    <div style={{ border: '1px solid #eaeaea', padding: '1.5rem', marginBottom: '2rem', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>Narrative Bridges Network</h2>
          <p style={{ margin: '5px 0 0 0', color: '#718096', fontSize: '14px' }}>Top 50 authors bridging narratives across isolated communities (Analyzed 4000 posts).</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowRankings(!showRankings)}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#3182ce', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold' }}
          >
            {showRankings ? 'Hide Spreaders' : 'View Top Spreaders'}
          </button>
          <button 
            onClick={handleReset}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '6px', color: '#495057', fontWeight: 'bold' }}
          >
            Reset Graph
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #edf2f7' }}>
        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', fontWeight: 'bold', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e53e3e' }}></div>
            <span style={{ color: '#e53e3e' }}>Authors (Brokers)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3182ce' }}></div>
            <span style={{ color: '#3182ce' }}>Communities (Targets)</span>
          </div>
        </div>
      </div>

      {showRankings && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fffaf0', borderRadius: '8px', border: '1px solid #feebc8', maxHeight: '200px', overflowY: 'auto' }}>
          <h4 style={{ marginTop: 0, color: '#dd6b20' }}>Top Ranked Spreaders</h4>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#2d3748', fontSize: '14px' }}>
            {rankedAuthors.map((author, idx) => (
              <li key={idx} style={{ marginBottom: '5px' }}><strong>{author.id}</strong></li>
            ))}
          </ol>
        </div>
      )}
      
      <div style={{ height: '500px', width: '100%', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fafbfc', border: '1px solid #e2e8f0' }}>
        <ForceGraph2D
          ref={fgRef}
          graphData={displayData}
          nodeLabel="id"
          nodeVal={6} 
          nodeColor={node => node.group === 'author' ? '#e53e3e' : '#3182ce'}
          onNodeClick={handleNodeClick}
          width={800} 
          height={500} 
          cooldownTicks={100}
          linkColor={() => 'rgba(203, 213, 225, 0.8)'}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
        />
      </div>
    </div>
  );
};

export default NetworkGraph;