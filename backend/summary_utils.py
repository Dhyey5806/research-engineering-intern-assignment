import pandas as pd
import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
) if api_key else None

def get_deepseek_json(prompt):
    if not client:
        print("ERROR: OpenRouter API key missing.")
        return None
    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a Senior Threat Intelligence Analyst. You output ONLY raw, valid JSON. No conversational filler. No markdown."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            temperature=0.0,
            max_tokens=250, 
            extra_body={"reasoning": {"enabled": False}} 
        )
        content = response.choices[0].message.content.strip()
        
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            json_str = match.group(0)
            return json.loads(json_str)
        else:
            print(f"DEEPSEEK JSON PARSE FAILED. Raw Output: {content}")
            return None
            
    except Exception as e:
        print(f"DEEPSEEK API ERROR: {str(e)}")
        return None

def generate_main_summaries(df, query, source="reddit"):
    fallback = {
        "timeline": "Unable to generate AI analysis. Check backend console for API limits.", 
        "community": "Unable to generate AI analysis. Check backend console for API limits."
    }
    
    if len(df) == 0 or not client: 
        return fallback

    df_copy = df.copy()
    df_copy['date'] = pd.to_datetime(df_copy.get('date', pd.Series()), errors='coerce')
    df_copy = df_copy.dropna(subset=['date'])
    
    if len(df_copy) > 0:
        total_items = len(df_copy)
        top_months = df_copy['date'].dt.strftime('%Y-%m').value_counts().head(3).to_dict()
    else:
        total_items = 0
        top_months = {"Unknown": 0}

    top_groups = df['subreddit'].value_counts().head(3).to_dict() if 'subreddit' in df else {"Unknown": 0}

    if source == "news":
        item_name = "articles"
        group_name = "News Portals/Publishers"
        context_rule = "Do NOT use the word 'subreddit' or 'post'. These are mainstream news articles published by news agencies."
    else:
        item_name = "posts"
        group_name = "Communities (Subreddits)"
        context_rule = "These are social media posts originating from specific Reddit communities."

    prompt = f"""
    Analyze this exact aggregated data for the target narrative: '{query}'.
    - Total {item_name.capitalize()} Analyzed: {total_items}
    - Top 3 Months by Volume (YYYY-MM: Count): {json.dumps(top_months)}
    - Top 3 Amplifying {group_name} (Name: Count): {json.dumps(top_groups)}
    
    Task: Write an executive summary. Return a JSON object with exactly two keys: "timeline" and "community". 
    Each value must be exactly ONE professional, highly analytical sentence.
    
    Directives:
    "timeline": State the absolute peak month and volume based STRICTLY on the numbers provided above. Use the word '{item_name}'. Do NOT invent numbers.
    "community": Explain the strategic significance of the top entities incubating this narrative based on the counts provided. {context_rule}
    """
    
    res = get_deepseek_json(prompt)
    return res if res and "timeline" in res else fallback

def generate_topic_summary(query, top_themes):
    fallback = "Unable to generate AI analysis. Check backend console for API limits."
    if not client or not top_themes: 
        return fallback

    theme_str = ", ".join(top_themes)
    prompt = f"""
    Analyze the clustered narrative themes regarding the target query: '{query}'.
    - Dominant Vectors Discovered: {theme_str}.

    Task: Return a JSON object with exactly one key: "topics".
    
    Directives:
    "topics": Write exactly ONE professional, highly analytical sentence explaining the strategic implications of these specific themes. Explain how these vectors drive the core narrative forward. Do not use filler text.
    """
    res = get_deepseek_json(prompt)
    return res.get("topics", fallback) if res else fallback