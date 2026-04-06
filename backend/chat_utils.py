import os
import json
import re
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

def get_chat_response(history, context_posts, timeline_data, subreddit_data, graph_data, topic_data):
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return {"answer": "API Key missing.", "suggestions": []}

    llm = ChatOpenAI(
        model="deepseek/deepseek-chat",
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
        max_tokens=400,
        temperature=0.0
    )

    messages = []
    
    sub_labels = subreddit_data.get('labels', [])
    sub_values = subreddit_data.get('values', [])
    sub_dict = dict(zip(sub_labels, sub_values))
    
    time_labels = timeline_data.get('labels', [])
    time_values = timeline_data.get('values', [])
    time_dict = dict(zip(time_labels, time_values))
    
    themes = topic_data.get('top_themes', []) if topic_data else []

    agg_str = f"""
    Top Communities by Total Engagement: {json.dumps(sub_dict)}
    Total Posts per Day: {json.dumps(time_dict)}
    Dominant Topics/Themes: {json.dumps(themes)}
    Number of Key Network Nodes: {len(graph_data.get('nodes', []))}
    """

    safe_posts = []
    for p in context_posts[:5]:
        text = str(p.get('selftext', 'N/A'))
        if text != 'N/A' and len(text) > 400:
            text = text[:400] + "... [TRUNCATED]"
        
        safe_posts.append(f"Author: {p.get('author', 'N/A')} | Subreddit: {p.get('subreddit', 'N/A')} | Date: {p.get('date', 'N/A')} | Title: {p.get('title', 'N/A')} | Text: {text}")

    context_str = "\n".join(safe_posts)
    
    system_prompt = f"""You are an elite, authoritative Intelligence Analyst. You suffer from complete amnesia regarding any external world knowledge.

CRITICAL DIRECTIVES:
1. OUTPUT FORMAT: You MUST return a valid JSON object. Do NOT use markdown code blocks (e.g., ```json). Just return the raw JSON.
2. JSON SCHEMA: Your output must exactly match this structure:
   {{
      "answer": "Your direct, authoritative response in plain text. NO MARKDOWN.",
      "suggestions": ["Follow up question 1?", "Follow up question 2?"]
   }}
3. AUTHORITATIVE VOICING: NEVER use phrases like "based on the dataset". Speak authoritatively.
4. OUT OF SCOPE / MISSING INFO: If the user asks about a topic not explicitly proven below, you MUST set "answer" to "I do not have intelligence on this specific topic." and set "suggestions" to an empty array [].

AGGREGATED METRICS:
{agg_str}

RAW CONTEXT:
{context_str}"""
    
    messages.append(SystemMessage(content=system_prompt))
    recent_history = history[-6:] if len(history) > 6 else history

    for msg in recent_history:
        if msg.get("role") == "user":
            messages.append(HumanMessage(content=msg.get("content")))
        elif msg.get("role") == "assistant":
            content = msg.get("content")
            if isinstance(content, dict):
                content = content.get("answer", "")
            messages.append(AIMessage(content=str(content)))

    try:
        response = llm.invoke(messages)
        content = response.content.strip()
        
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        else:
            print(f"CHAT JSON PARSE FAILED. Raw: {content}")
            return {"answer": content, "suggestions": []}
            
    except Exception as e:
        error_msg = str(e).lower()
        if "402" in error_msg or "balance" in error_msg:
            return {"answer": "API Error: OpenRouter API key balance is $0.00.", "suggestions": []}
        elif "limit exceeded" in error_msg or "context_length" in error_msg:
            return {"answer": "System Error: Memory capacity exceeded despite sliding window. Try refreshing the page.", "suggestions": []}
        return {"answer": f"Agent Error: {str(e)}", "suggestions": []}