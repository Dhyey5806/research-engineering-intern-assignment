import os
import requests
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

def fetch_news_data(query):
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        raise Exception("NEWS_API_KEY not found in environment variables.")
        
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "language": "en",
        "sortBy": "relevancy",
        "pageSize": 100, 
        "apiKey": api_key
    }
    
    response = requests.get(url, params=params)
    if response.status_code != 200:
        error_msg = response.json().get('message', 'Unknown API Error')
        raise Exception(f"NewsAPI Error: {error_msg}")
        
    articles = response.json().get("articles", [])
    
    if not articles:
        return pd.DataFrame()
        
    processed_data = []
    for article in articles:
        source_name = article.get("source", {}).get("name", "Unknown Portal")
        
        author = article.get("author") or "Staff Writer"
        if len(author) > 30 or "http" in author:
            author = "Staff Writer"
            
        title = article.get("title") or ""
        desc = article.get("description") or ""
        content = article.get("content") or ""
        
        
        selftext = f"{desc} {content}".strip()
        
        processed_data.append({
            "date": article.get("publishedAt"),
            "subreddit": source_name,   
            "author": author,       
            "title": title,
            "selftext": selftext,
            "score": 1,                  
            "num_comments": 0
        })
        
    df = pd.DataFrame(processed_data)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    return df