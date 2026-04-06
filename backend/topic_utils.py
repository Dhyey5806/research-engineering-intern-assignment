import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer, ENGLISH_STOP_WORDS
from sklearn.metrics.pairwise import cosine_similarity
import traceback
import re
import umap
import datamapplot

INTERNET_GARBAGE = [
    'amp', 'http', 'https', 'www', 'com', 'reddit', 'thread', 'post', 'comment', 
    'deleted', 'removed', 'edit', 'update', 'message', 'discussion', 'sub', 
    'subreddit', 'people', 'just', 'like', 'know', 'think', 'time', 'good', 
    'want', 'make', 'really', 'even', 'much', 'need', 'something', 'anything', 
    'nothing', 'going', 'would', 'could', 'should', 'look', 'take', 'first', 'also',
    'ul', 'li', 'br', 'href', 'span', 'div', 'nbsp', 'quot', 'strong', 'em', 'p', 'a'
]

ALL_STOP_WORDS = list(ENGLISH_STOP_WORDS.union(set(INTERNET_GARBAGE)))

PREMIUM_PALETTE = [
    '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', 
    '#d946ef', '#84cc16', '#14b8a6', '#f97316', '#6366f1'
]

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    return text.lower()

def generate_topic_trends(df, model, num_clusters=4):
    try:
        if df is None or len(df) == 0:
            return {"labels": [], "datasets": [], "top_themes": [], "datamap_html": ""}

        df = df.copy()
        
        # --- FOOLPROOF TEXT EXTRACTION ---
        if 'title' in df.columns:
            titles = df['title'].fillna("").astype(str)
        else:
            titles = pd.Series([""] * len(df), index=df.index)
            
        if 'selftext' in df.columns:
            texts = df['selftext'].fillna("").astype(str)
        elif 'description' in df.columns:
            texts = df['description'].fillna("").astype(str)
        elif 'content' in df.columns:
            texts = df['content'].fillna("").astype(str)
        else:
            texts = pd.Series([""] * len(df), index=df.index)

        combined_series = titles + " " + texts
        combined_texts = combined_series.apply(clean_text).tolist()

        if all(len(t.strip()) == 0 for t in combined_texts):
             return {"labels": [], "datasets": [], "top_themes": [], "datamap_html": ""}

        actual_clusters = min(num_clusters, len(df))

        # --- KEYWORD EXTRACTION ---
        vectorizer = TfidfVectorizer(stop_words=ALL_STOP_WORDS, ngram_range=(2, 3), max_features=50)
        try:
            tfidf_matrix = vectorizer.fit_transform(combined_texts)
            scores = tfidf_matrix.sum(axis=0).A1
            actual_clusters = min(actual_clusters, len(scores))
            
            if actual_clusters == 0:
                raise ValueError("No clusters found")
                
            top_indices = scores.argsort()[-actual_clusters:][::-1]
            feature_names = vectorizer.get_feature_names_out()
            suggested_words = [feature_names[idx] for idx in top_indices]
        except Exception:
            actual_clusters = min(num_clusters, len(df))
            suggested_words = [f"Theme {i+1}" for i in range(actual_clusters)]

        # --- EMBEDDINGS ---
        theme_embeddings = model.encode(suggested_words, show_progress_bar=False)
        post_embeddings = model.encode(combined_texts, show_progress_bar=False)

        similarities = cosine_similarity(post_embeddings, theme_embeddings)
        cluster_ids = np.argmax(similarities, axis=1)
        df['cluster_id'] = cluster_ids

        cluster_names = {i: suggested_words[i].title() for i in range(actual_clusters)}
        top_themes_list = [cluster_names[i] for i in range(actual_clusters)]

        color_mapping = {}
        for i in range(actual_clusters):
            color_mapping[cluster_names[i]] = PREMIUM_PALETTE[i % len(PREMIUM_PALETTE)]
        color_mapping["Uncategorized"] = "#cbd5e1"

        # --- THE ML EMBEDDING PROJECTION (DATAMAPPLOT) ---
        datamap_html = ""
        try:
            jitter = np.random.normal(0, 0.05, post_embeddings.shape).astype(np.float32)
            safe_embeddings = post_embeddings + jitter
            
            n_neighbors = int(max(2, min(15, len(safe_embeddings) - 1)))
            reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=0.1, n_components=2, random_state=42)
            data_map_coords = reducer.fit_transform(safe_embeddings)

            labels = np.array([cluster_names.get(cid, "Uncategorized") for cid in cluster_ids])
            
            if 'title' in df.columns:
                hover_text = df['title'].fillna("Signal").apply(lambda x: str(x)[:100] + "...").tolist()
            else:
                hover_text = ["Intelligence Signal"] * len(df)

            plot = datamapplot.create_interactive_plot(
                data_map_coords, 
                labels,
                hover_text=hover_text,
                label_color_map=color_mapping, # <--- THIS WAS THE FIX! 
                title="Semantic Narrative Landscape",
                sub_title="High-dimensional clustering of signals based on linguistic proximity.",
                logo=None,
                enable_search=True
            )
            datamap_html = str(plot)
        except Exception as e:
            print(f"Datamapplot failed: {e}")
            datamap_html = ""

        # --- TIMELINE PREP ---
        if 'date' not in df.columns:
            return {"labels": [], "datasets": [], "top_themes": top_themes_list, "datamap_html": datamap_html}
            
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date'])

        if len(df) == 0:
            return {"labels": [], "datasets": [], "top_themes": top_themes_list, "datamap_html": datamap_html}

        df['date_str'] = df['date'].dt.strftime('%Y-%m-%d')
        daily_counts = df.groupby(['date_str', 'cluster_id']).size().unstack(fill_value=0)
        all_dates = sorted(df['date_str'].unique())
        datasets = []

        for cluster_id in cluster_names.keys():
            data_points = []
            for date in all_dates:
                if cluster_id in daily_counts.columns and date in daily_counts.index:
                    val = int(daily_counts.at[date, cluster_id])
                else:
                    val = 0
                data_points.append(val)

            hex_color = PREMIUM_PALETTE[cluster_id % len(PREMIUM_PALETTE)]
            bg_hex = hex_color + "1A" 

            datasets.append({
                "label": cluster_names[cluster_id],
                "data": data_points,
                "borderColor": hex_color,
                "backgroundColor": bg_hex,
                "fill": True,
                "tension": 0.4
            })

        return {
            "labels": all_dates, 
            "datasets": datasets, 
            "top_themes": top_themes_list,
            "datamap_html": datamap_html 
        }

    except Exception as e:
        traceback.print_exc()
        return {"labels": [], "datasets": [], "top_themes": [], "datamap_html": ""}