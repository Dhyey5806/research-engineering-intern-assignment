import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer, ENGLISH_STOP_WORDS
from sklearn.metrics.pairwise import cosine_similarity
import traceback
import re

INTERNET_GARBAGE = [
    'amp', 'http', 'https', 'www', 'com', 'reddit', 'thread', 'post', 'comment', 
    'deleted', 'removed', 'edit', 'update', 'message', 'discussion', 'sub', 
    'subreddit', 'people', 'just', 'like', 'know', 'think', 'time', 'good', 
    'want', 'make', 'really', 'even', 'much', 'need', 'something', 'anything', 
    'nothing', 'going', 'would', 'could', 'should', 'look', 'take', 'first', 'also'
]

ALL_STOP_WORDS = list(ENGLISH_STOP_WORDS.union(set(INTERNET_GARBAGE)))

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    return text.lower()

def generate_topic_trends(df, model, num_clusters=4):
    try:
        if len(df) < num_clusters:
            return {"labels": [], "datasets": [], "top_themes": []}

        df = df.copy()
        
        titles = df['title'].apply(clean_text)
        texts = df['selftext'].apply(clean_text)
        combined_texts = (titles + " " + texts).tolist()

        vectorizer = TfidfVectorizer(stop_words=ALL_STOP_WORDS, ngram_range=(2, 3), max_features=50)
        
        try:
            tfidf_matrix = vectorizer.fit_transform(combined_texts)
            scores = tfidf_matrix.sum(axis=0).A1
            top_indices = scores.argsort()[-num_clusters:][::-1]
            feature_names = vectorizer.get_feature_names_out()
            suggested_words = [feature_names[idx] for idx in top_indices]
        except Exception:
            suggested_words = [f"Theme {i+1}" for i in range(num_clusters)]

        if len(suggested_words) < num_clusters:
            return {"labels": [], "datasets": [], "top_themes": []}

        theme_embeddings = model.encode(suggested_words, show_progress_bar=False)
        post_embeddings = model.encode(combined_texts, show_progress_bar=False)

        similarities = cosine_similarity(post_embeddings, theme_embeddings)
        
        df['cluster_id'] = np.argmax(similarities, axis=1)

        cluster_names = {i: suggested_words[i].title() for i in range(num_clusters)}
        top_themes_list = [cluster_names[i] for i in range(num_clusters)]

        df['date'] = pd.to_datetime(df.get('date', pd.Series()), errors='coerce')
        df = df.dropna(subset=['date'])

        if len(df) == 0:
            return {"labels": [], "datasets": [], "top_themes": []}

        df['date_str'] = df['date'].dt.strftime('%Y-%m-%d')
        
        daily_counts = df.groupby(['date_str', 'cluster_id']).size().unstack(fill_value=0)

        all_dates = sorted(df['date_str'].unique())
        datasets = []

        colors = ['#3182ce', '#e53e3e', '#38a169', '#d69e2e', '#805ad5', '#dd6b20', '#319795', '#e53e3e']
        bg_colors = ['rgba(49, 130, 206, 0.1)', 'rgba(229, 62, 62, 0.1)', 'rgba(56, 161, 105, 0.1)', 'rgba(214, 158, 46, 0.1)', 'rgba(128, 90, 213, 0.1)', 'rgba(221, 107, 32, 0.1)', 'rgba(49, 151, 149, 0.1)', 'rgba(229, 62, 62, 0.1)']

        for cluster_id in cluster_names.keys():
            data_points = []
            for date in all_dates:
                if cluster_id in daily_counts.columns and date in daily_counts.index:
                    val = int(daily_counts.at[date, cluster_id])
                else:
                    val = 0
                data_points.append(val)

            datasets.append({
                "label": cluster_names[cluster_id],
                "data": data_points,
                "borderColor": colors[cluster_id % len(colors)],
                "backgroundColor": bg_colors[cluster_id % len(bg_colors)],
                "fill": True,
                "tension": 0.4
            })

        return {"labels": all_dates, "datasets": datasets, "top_themes": top_themes_list}

    except Exception as e:
        traceback.print_exc()
        return {"labels": [], "datasets": [], "top_themes": []}