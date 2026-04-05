import React, { useState, useRef, useEffect } from 'react';

const ChatBot = ({ rawResults, timelineData, subredditData, graphData, topicData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || rawResults.length === 0) return;

    const userMessage = { role: 'user', content: input };
    const updatedHistory = [...messages, userMessage];
    
    const cleanHistory = updatedHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: cleanHistory,
          context: rawResults,
          timeline_data: timelineData || {},
          subreddit_data: subredditData || {},
          graph_data: graphData || {},
          topic_data: topicData || {}
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      // Safely parse the JSON response from the backend
      const aiResponse = data.response;
      const answer = typeof aiResponse === 'object' ? aiResponse.answer : aiResponse;
      const suggestions = typeof aiResponse === 'object' ? (aiResponse.suggestions || []) : [];

      setMessages([...updatedHistory, { role: 'assistant', content: answer, suggestions: suggestions }]);
    } catch (error) {
      setMessages([...updatedHistory, { role: 'assistant', content: "Connection error. Please try again.", suggestions: [] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
      {isOpen && (
        <div style={{ width: '450px', height: '650px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
          <div style={{ backgroundColor: '#3182ce', color: '#ffffff', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Data Analyst Agent</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '20px' }}>×</button>
          </div>
          
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
            {rawResults.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#718096', fontSize: '14px', marginTop: '20px' }}>Run a search first to load data into the agent's memory.</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
                    <div style={{ maxWidth: '85%', padding: '12px 16px', borderRadius: '18px', backgroundColor: msg.role === 'user' ? '#3182ce' : '#ffffff', color: msg.role === 'user' ? '#ffffff' : '#2d3748', border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none', fontSize: '14px', lineHeight: '1.5', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      {msg.content}
                    </div>
                  </div>
                  
                  {/* NEW: Render Suggestion Pills ONLY for the last AI message, and hide when loading */}
                  {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && idx === messages.length - 1 && !isLoading && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: '5px', marginTop: '5px' }}>
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(sug)} // Instantly populates the input box!
                          style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#edf2f7', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '16px', cursor: 'pointer', transition: 'background-color 0.2s', textAlign: 'left' }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#edf2f7'}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                <div style={{ padding: '12px 16px', borderRadius: '18px', backgroundColor: '#ffffff', color: '#718096', border: '1px solid #e2e8f0', fontSize: '14px' }}>Analyzing data...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', padding: '12px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about engagement, subreddits, or posts..."
              disabled={rawResults.length === 0 || isLoading}
              style={{ flex: 1, padding: '12px', borderRadius: '24px', border: '1px solid #cbd5e0', outline: 'none', fontSize: '14px' }}
            />
            <button type="submit" disabled={rawResults.length === 0 || isLoading || !input.trim()} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: (!input.trim() || isLoading) ? '#a0aec0' : '#3182ce', color: '#ffffff', border: 'none', borderRadius: '24px', cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '65px', height: '65px', borderRadius: '50%', backgroundColor: '#3182ce', color: '#ffffff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', float: 'right' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </div>
  );
};

export default ChatBot;