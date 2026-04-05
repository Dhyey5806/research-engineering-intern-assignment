import pandas as pd
import json
import re

cleaned_records = []


with open('data.jsonl', 'r', encoding='utf-8') as file:
    for line in file:
        try:
            raw_json = json.loads(line)
            post_data = raw_json.get('data', {})
            
            clean_row = {
                'id': post_data.get('id'),
                'author': post_data.get('author'),
                'title': post_data.get('title'),
                'selftext': post_data.get('selftext', '').replace('\n', ' ').replace('\r', ''),
                'subreddit': post_data.get('subreddit'),
                'url': post_data.get('url'),
                'domain': post_data.get('domain'),
                'permalink': f"https://www.reddit.com{post_data.get('permalink', '')}",
                'score': post_data.get('score', 0),
                'num_comments': post_data.get('num_comments', 0),
                'created_utc': post_data.get('created_utc')
            }
            cleaned_records.append(clean_row)
        except Exception as e:
            continue

df = pd.DataFrame(cleaned_records)

df['date'] = pd.to_datetime(df['created_utc'], unit='s')

def extract_hashtags(text):
    if not isinstance(text, str): return []
    tags = re.findall(r"#\w+", text)
    return ", ".join(tags)

df['hashtags'] = (df['title'] + " " + df['selftext']).apply(extract_hashtags)

df.to_csv('simppl_dashboard_data.csv', index=False)

print(f"Data Engineering Complete! Cleaned {len(df)} rows.")
print(df[['author', 'subreddit', 'score', 'hashtags']].head())