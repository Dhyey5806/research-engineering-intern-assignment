import os
import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

def get_chat_response(history, context_posts, timeline_data, subreddit_data, graph_data, topic_data):
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return "API Key missing."

    llm = ChatOpenAI(
        model="deepseek/deepseek-chat",
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
        max_tokens=1500,
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
    for p in context_posts[:75]:
        text = str(p.get('selftext', 'N/A'))
        if text != 'N/A' and len(text) > 800:
            text = text[:800] + "... [TRUNCATED]"
        
        safe_posts.append(f"Author: {p.get('author', 'N/A')} | Subreddit: {p.get('subreddit', 'N/A')} | Date: {p.get('date', 'N/A')} | Title: {p.get('title', 'N/A')} | Text: {text}")

    context_str = "\n".join(safe_posts)
    
    system_prompt = f"""You are an elite, authoritative Intelligence Analyst. You suffer from complete amnesia regarding any external world knowledge.

CRITICAL DIRECTIVES:
1. NO MARKDOWN: You MUST NOT use any markdown formatting. Do not use asterisks, hashtags, or backticks. Use plain text, standard paragraph breaks, and standard numbering (1, 2, 3) for lists.
2. AUTHORITATIVE VOICING: NEVER use phrases like "based on the dataset", "according to the metrics", "the raw data shows", or "in the text provided". Speak authoritatively as if you inherently know the facts. Present the findings directly.
3. INFORMATION BOUNDARIES: Answer questions using ONLY the provided metrics and context below. Do not guess or use external knowledge.
4. MISSING INFORMATION: If the user asks about a topic not explicitly proven by the information below, you MUST reply exactly with: "I do not have intelligence on this specific topic."

AGGREGATED METRICS:
{agg_str}

RAW CONTEXT:
{context_str}"""
    
    messages.append(SystemMessage(content=system_prompt))

    for msg in history:
        if msg.get("role") == "user":
            messages.append(HumanMessage(content=msg.get("content")))
        elif msg.get("role") == "assistant":
            messages.append(AIMessage(content=msg.get("content")))

    try:
        response = llm.invoke(messages)
        return response.content
    except Exception as e:
        if "402" in str(e) or "limit exceeded" in str(e).lower():
            return "System Error: The conversation history has exceeded the memory capacity. Please clear the chat."
        return f"Agent Error: {str(e)}"