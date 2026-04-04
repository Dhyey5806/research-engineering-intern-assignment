import networkx as nx
from itertools import combinations

def build_network_graph(results_df):
    G = nx.Graph()
    items_to_authors = {}
    
    for _, row in results_df.iterrows():
        author = row['author']
        if not author:
            continue
            
        tags = [t.strip() for t in str(row.get('hashtags', '')).split(',') if t.strip()]
        domain = row.get('domain')
        
        for tag in tags:
            items_to_authors.setdefault(f"tag:{tag}", set()).add(author)
        if domain and domain != 'reddit.com':
            items_to_authors.setdefault(f"domain:{domain}", set()).add(author)

    for item, authors in items_to_authors.items():
        if len(authors) > 1:
            for u, v in combinations(authors, 2):
                if G.has_edge(u, v):
                    G[u][v]['weight'] += 1
                else:
                    G.add_edge(u, v, weight=1)

    G.remove_nodes_from(list(nx.isolates(G)))

    if G.number_of_nodes() == 0:
        return {"nodes": [], "links": []}

    centrality = nx.betweenness_centrality(G, weight='weight')

    sorted_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)
    
    top_nodes = set([node for node, score in sorted_nodes[:50]])
    
    subgraph = G.subgraph(top_nodes)

    nodes = [{"id": node, "val": centrality[node]} for node in subgraph.nodes()]
    links = [{"source": u, "target": v, "weight": d['weight']} for u, v, d in subgraph.edges(data=True)]

    return {"nodes": nodes, "links": links}