import React, { useState, useMemo, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, RotateCcw, Eye, EyeOff, Shield } from 'lucide-react';

const NetworkGraph = ({ graphData }) => {
  const [showRankings, setShowRankings] = useState(false);
  const [hiddenNodes, setHiddenNodes] = useState(new Set());
  const fgRef = useRef();

  const displayData = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], links: [] };

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
    setHiddenNodes(new Set());
    setTimeout(() => {
      fgRef.current?.zoomToFit(400, 50);
    }, 100);
  };

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="echo-card animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <Network className="w-5 h-5 text-emerald-500" />
          <h2 className="echo-section-title">Influence Network</h2>
        </div>
        <p className="echo-section-subtitle mt-2">
          No cross-community bridges detected in the analyzed dataset.
        </p>
      </div>
    );
  }

  const rankedAuthors = displayData.nodes
    .filter(n => n.group === 'author')
    .sort((a, b) => b.val - a.val);

  return (
    <div className="echo-card animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-emerald-500" />
          <h2 className="echo-section-title">Narrative Bridges Network</h2>
        </div>
      </div>
      <p className="echo-section-subtitle mb-4">
        Top 50 entities bridging narratives across isolated communities (Analyzed 4000 signals).
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setShowRankings(!showRankings)}
          className="echo-btn-primary text-xs"
        >
          {showRankings ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showRankings ? 'Hide Spreaders' : 'View Top Spreaders'}
        </button>
        <button onClick={handleReset} className="echo-btn-secondary text-xs">
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Graph
        </button>

        <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(0, 72%, 51%)' }} />
            Entities (Brokers)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(160, 84%, 39%)' }} />
            Communities (Targets)
          </span>
        </div>
      </div>

      {showRankings && (
        <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-border max-h-[200px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-semibold text-foreground">Top Ranked Spreaders</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {rankedAuthors.map((author, idx) => (
              <div key={idx} className="text-xs text-muted-foreground py-1 px-2 rounded bg-muted/50">
                <span className="font-mono text-foreground font-medium">#{idx + 1}</span>{' '}
                {author.id}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
        <ForceGraph2D
          ref={fgRef}
          graphData={displayData}
          nodeLabel="id"
          nodeColor={node => node.group === 'author' ? 'hsl(0, 72%, 51%)' : 'hsl(160, 84%, 39%)'}
          onNodeClick={handleNodeClick}
          width={800}
          height={500}
          cooldownTicks={100}
          linkColor={() => 'hsla(215, 14%, 63%, 0.4)'}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
        />
      </div>
    </div>
  );
};

export default NetworkGraph;
