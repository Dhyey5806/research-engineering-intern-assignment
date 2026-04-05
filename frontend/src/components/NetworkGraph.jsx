import React, { useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NetworkGraph = ({ graphData }) => {
  const [nodeCount, setNodeCount] = useState(50);
  const [hiddenNodes, setHiddenNodes] = useState(new Set());

  const displayData = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], links: [] };
    const sortedNodes = [...graphData.nodes].sort((a, b) => b.val - a.val);
    const topNodes = sortedNodes.slice(0, nodeCount);
    const topNodeIds = new Set(topNodes.map(n => n.id));

    const visibleNodes = topNodes.filter(n => !hiddenNodes.has(n.id));
    const visibleLinks = graphData.links.filter(
      l => {
        const sourceId = l.source.id || l.source;
        const targetId = l.target.id || l.target;
        return topNodeIds.has(sourceId) && topNodeIds.has(targetId) && !hiddenNodes.has(sourceId) && !hiddenNodes.has(targetId);
      }
    );
    return { nodes: visibleNodes, links: visibleLinks };
  }, [graphData, nodeCount, hiddenNodes]);

  const handleNodeClick = (node) => {
    const newHidden = new Set(hiddenNodes);
    newHidden.add(node.id);
    setHiddenNodes(newHidden);
  };

  const handleReset = () => {
    setHiddenNodes(new Set());
    setNodeCount(50);
  };

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div style={{ border: '1px solid #eee', padding: '1.5rem', marginBottom: '2rem', borderRadius: '8px', backgroundColor: '#fff' }}>
        <h2 style={{ marginTop: 0 }}>Influence Network</h2>
        <p style={{ color: '#666' }}>No significant connections found for this narrative.</p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #eaeaea', padding: '1.5rem', marginBottom: '2rem', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Influence Network</h2>
        <button 
          onClick={handleReset}
          style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '6px', color: '#495057', fontWeight: 'bold' }}
        >
          Reset View
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #edf2f7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <label style={{ fontWeight: 'bold', color: '#4a5568', fontSize: '14px' }}>Number of Key Accounts Displayed:</label>
          <span style={{ fontWeight: 'bold', color: '#3182ce', fontSize: '15px' }}>{nodeCount}</span>
        </div>
        <input 
          type="range" min="2" max="50" value={nodeCount} 
          onChange={(e) => setNodeCount(parseInt(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: '#3182ce' }}
        />
      </div>
      
      <div style={{ height: '500px', width: '100%', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fafbfc' }}>
        <ForceGraph2D
          graphData={displayData}
          nodeLabel="id"
          nodeVal={node => Math.max(node.val * 300, 4)}
          nodeColor={node => node.val > 0.05 ? '#e53e3e' : '#3182ce'}
          onNodeClick={handleNodeClick}
          width={800} height={500} cooldownTicks={100}
          linkColor={() => 'rgba(203, 213, 225, 0.4)'}
        />
      </div>
    </div>
  );
};

export default NetworkGraph;