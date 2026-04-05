import networkx as nx

def build_network_graph(results_df):
    G = nx.Graph()
    
    for _, row in results_df.iterrows():
        author = row.get('author')
        subreddit = row.get('subreddit')
        
        if not author or author == '[deleted]' or not subreddit:
            continue
            
        G.add_node(author, type='author')
        G.add_node(subreddit, type='subreddit')
        
        if G.has_edge(author, subreddit):
            G[author][subreddit]['weight'] += 1
        else:
            G.add_edge(author, subreddit, weight=1)

    if G.number_of_nodes() == 0:
        return {"nodes": [], "links": []}

    # === THE PRUNING SHEARS ===
    # Delete any author who only posted in 1 subreddit. They are not bridges.
    authors = [n for n, attr in G.nodes(data=True) if attr['type'] == 'author']
    for author in authors:
        if G.degree(author) < 2:
            G.remove_node(author)

    # Clean up any subreddits that are now floating alone
    G.remove_nodes_from(list(nx.isolates(G)))

    if G.number_of_nodes() == 0:
        return {"nodes": [], "links": []}

    # Now run the math ONLY on the actual bridges
    centrality = nx.betweenness_centrality(G)

    # Sort authors by influence
    sorted_authors = sorted(
        [n for n in G.nodes if G.nodes[n]['type'] == 'author'], 
        key=lambda x: centrality.get(x, 0), 
        reverse=True
    )
    
    # Grab Top 50 Authors
    top_50_authors = set(sorted_authors[:50])
    
    # Grab the exact subreddits they bridge
    final_nodes = set(top_50_authors)
    for author in top_50_authors:
        final_nodes.update(G.neighbors(author))
        
    subgraph = G.subgraph(final_nodes)

    nodes = [{"id": n, "val": centrality.get(n, 0), "group": G.nodes[n]['type']} for n in subgraph.nodes()]
    links = [{"source": u, "target": v, "weight": d['weight']} for u, v, d in subgraph.edges(data=True)]

    return {"nodes": nodes, "links": links}