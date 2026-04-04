from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer
import numpy as np
import uvicorn
from graph_utils import build_network_graph

df = None
index = None
model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global df, index, model
    print("Server Starting up: Loading Data into Memory...")
    try:
        df = pd.read_csv('../data/cleaned_simppl_data.csv')
        df = df.replace({np.nan: None}) 
        index = faiss.read_index('vector_store.index')
        model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print(f"Data loaded successfully. Database size: {len(df)} rows.")
    except Exception as e:
        print(f"ERROR LOADING DATA: {e}")
    yield 

app = FastAPI(title="SimPPL Investigative Dashboard API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/search")
async def semantic_search(query: str = "", limit: int = 500):
    clean_query = query.strip()
    
    # We keep the 3-character defense, which safely stops single-letter spam
    if len(clean_query) < 3:
        return {"query": query, "results_count": 0, "results": [], "graph": {"nodes": [], "links": []}}
    
    try:
        query_vector = model.encode([clean_query])
        D, I = index.search(query_vector, limit)
        
        # The broken distance threshold has been completely removed.
        
        matching_rows = df.iloc[I[0]]
        results = matching_rows.to_dict(orient='records')
        graph_data = build_network_graph(matching_rows)
        
        return {
            "query": query,
            "results_count": len(results),
            "results": results,
            "graph": graph_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__":
    print("Starting Uvicorn server...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)