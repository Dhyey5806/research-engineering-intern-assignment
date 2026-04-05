from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer, util
import numpy as np
import uvicorn
import traceback
from graph_utils import build_network_graph
from topic_utils import generate_topic_trends
from summary_utils import generate_main_summaries, generate_topic_summary
from pydantic import BaseModel
from typing import List, Dict, Any
from chat_utils import get_chat_response
from news_utils import fetch_news_data


df = None
index = None
model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global df, index, model
    try:
        df = pd.read_csv('../data/cleaned_simppl_data.csv')
        df = df.replace({np.nan: None})
        df['date'] = pd.to_datetime(df['date'], errors='coerce') 
        index = faiss.read_index('vector_store.index')
        model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    except Exception as e:
        pass
    yield 

app = FastAPI(title="SimPPL API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def filter_by_date(matching_rows, start_date, end_date):
    filtered_df = matching_rows.copy()
    if start_date:
        filtered_df = filtered_df[filtered_df['date'] >= pd.to_datetime(start_date)]
    if end_date:
        filtered_df = filtered_df[filtered_df['date'] <= pd.to_datetime(end_date) + pd.Timedelta(days=1)]
    return filtered_df

class ChatRequest(BaseModel):
    history: List[Dict[str, str]]
    context: List[Dict[str, Any]]
    timeline_data: Dict[str, Any]
    subreddit_data: Dict[str, Any]
    graph_data: Dict[str, Any]
    topic_data: Optional[Dict[str, Any]] = None

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        answer = get_chat_response(
            request.history, 
            request.context,
            request.timeline_data,
            request.subreddit_data,
            request.graph_data,
            request.topic_data
        )
        return {"response": answer}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
import uuid
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from chat_utils import get_chat_response
from news_utils import fetch_news_data 


@app.get("/api/search")
async def semantic_search(query: str = "", source: str = "reddit", limit: int = 200, start_date: Optional[str] = None, end_date: Optional[str] = None):
    clean_query = query.strip()
    empty_summaries = {"timeline": "", "community": "", "topics": "", "network": ""}

    if len(clean_query) < 3:
        return {"query": query, "results_count": 0, "results": [], "graph": {"nodes": [], "links": []}, "summaries": empty_summaries, "warning": None}
    
    try:
        warning_msg = None
        
        
        if source == "news":
            matching_rows = fetch_news_data(clean_query)
            if len(matching_rows) == 0:
                 return {"query": query, "results_count": 0, "results": [], "graph": {"nodes": [], "links": []}, "summaries": empty_summaries, "warning": "No news articles found for this query."}
        
        else:
            query_vector = model.encode([clean_query])
            D, I = index.search(query_vector, limit)
            valid_indices = [idx for idx in I[0] if idx != -1]
            
            if not valid_indices:
                 return {"query": query, "results_count": 0, "results": [], "graph": {"nodes": [], "links": []}, "summaries": empty_summaries, "warning": None}
                
            best_match_idx = valid_indices[0]
            best_match_row = df.iloc[best_match_idx]
            best_text = str(best_match_row.get('title', '')) + " " + str(best_match_row.get('selftext', ''))
            best_vector = model.encode([best_text])
            similarity_score = float(util.cos_sim(query_vector, best_vector).item())
            
            if similarity_score < 0.45:
                warning_msg = f"Warning: Low confidence match (Score: {similarity_score:.2f})."
                
            matching_rows = df.iloc[valid_indices]
            matching_rows = filter_by_date(matching_rows, start_date, end_date)

        results = matching_rows.to_dict(orient='records')
        graph_data = build_network_graph(matching_rows)
        summaries = generate_main_summaries(matching_rows, query, source)
        summaries["topics"] = "Waiting for Deep Narrative Analysis execution..."
        
        return {
            "query": query,
            "results_count": len(results),
            "results": results,
            "graph": graph_data,
            "summaries": summaries,
            "warning": warning_msg
        }
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/topics")
async def get_topics(query: str = "", source: str = "reddit", limit: int = 200, clusters: int = 4, start_date: Optional[str] = None, end_date: Optional[str] = None):
    clean_query = query.strip()
    if len(clean_query) < 3:
        return {"topics": {"labels": [], "datasets": [], "top_themes": []}, "topic_summary": ""}
        
    try:
        if source == "news":
            matching_rows = fetch_news_data(clean_query)
            if len(matching_rows) == 0:
                return {"topics": {"labels": [], "datasets": [], "top_themes": []}, "topic_summary": ""}
        
        else:
            query_vector = model.encode([clean_query])
            
            D, I = index.search(query_vector, limit) 
            valid_indices = [idx for idx in I[0] if idx != -1]
            
            if not valid_indices:
                 return {"query": query, "results_count": 0, "results": [], "graph": {"nodes": [], "links": []}, "summaries": empty_summaries, "warning": None}
                
            best_match_row = df.iloc[valid_indices[0]]
            best_text = str(best_match_row.get('title', '')) + " " + str(best_match_row.get('selftext', ''))
            best_vector = model.encode([best_text])
            similarity_score = float(util.cos_sim(query_vector, best_vector).item())
            
            if similarity_score < 0.45:
                warning_msg = f"Warning: Low confidence match (Score: {similarity_score:.2f})."
                
            matching_rows = df.iloc[valid_indices]
            matching_rows = filter_by_date(matching_rows, start_date, end_date)
            D_graph, I_graph = index.search(query_vector, 4000)
            valid_indices_graph = [idx for idx in I_graph[0] if idx != -1]
            matching_rows_graph = df.iloc[valid_indices_graph]
            matching_rows_graph = filter_by_date(matching_rows_graph, start_date, end_date)

            graph_data = build_network_graph(matching_rows_graph)

        results = matching_rows.to_dict(orient='records')
        
        if source == "news":
            graph_data = build_network_graph(matching_rows)
            
        summaries = generate_main_summaries(matching_rows, query, source)
        summaries["topics"] = "Waiting for Deep Narrative Analysis execution..."
        
        topic_data = generate_topic_trends(matching_rows, model, clusters)
        topic_summary_text = generate_topic_summary(query, topic_data.get('top_themes', []))
        
        return {
            "topics": topic_data,
            "topic_summary": topic_summary_text
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)