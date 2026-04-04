import pandas as pd
import json
import re

cleaned_records = []

# 1. Open the raw data line by line to prevent crashing
with open('data.jsonl', 'r', encoding='utf-8') as file:
    for line in file:
        try:
            raw_json = json.loads(line)
            post_data = raw_json.get('data', {})
            
            # 2. Extract ONLY the fields that passed our strict inspection
            clean_row = {
                'id': post_data.get('id'),
                'author': post_data.get('author'),
                'title': post_data.get('title'),
                'selftext': post_data.get('selftext', '').replace('\n', ' ').replace('\r', ''),
                'subreddit': post_data.get('subreddit'),
                'url': post_data.get('url'),
                'domain': post_data.get('domain'),
                'permalink': f"https://www.reddit.com{post_data.get('permalink', '')}", # Make it a clickable link
                'score': post_data.get('score', 0),
                'num_comments': post_data.get('num_comments', 0),
                'created_utc': post_data.get('created_utc')
            }
            cleaned_records.append(clean_row)
        except Exception as e:
            continue

# 3. Put it into a neat table
df = pd.DataFrame(cleaned_records)

# 4. Convert the weird Unix timestamp into a normal Date (e.g. 2024-02-18)
df['date'] = pd.to_datetime(df['created_utc'], unit='s')

# 5. Feature Engineering: Extract hashtags for our future Graph Theory algorithm!
def extract_hashtags(text):
    if not isinstance(text, str): return []
    # Find words starting with #
    tags = re.findall(r"#\w+", text)
    # Convert list to a comma-separated string so it saves easily in CSV
    return ", ".join(tags)

# We check both the title and the body for hashtags
df['hashtags'] = (df['title'] + " " + df['selftext']).apply(extract_hashtags)

# 6. Save the masterpiece
df.to_csv('simppl_dashboard_data.csv', index=False)

print(f"Data Engineering Complete! Cleaned {len(df)} rows.")
# Show the first few rows of our beautiful new data
print(df[['author', 'subreddit', 'score', 'hashtags']].head())