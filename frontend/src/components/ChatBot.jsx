import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User } from 'lucide-react';

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
      const aiResponse = data.response;
      const answer = typeof aiResponse === 'object' ? aiResponse.answer : aiResponse;
      const suggestions = typeof aiResponse === 'object' ? (aiResponse.suggestions || []) : [];

      setMessages([...updatedHistory, { role: 'assistant', content: answer, suggestions: suggestions }]);
    } catch {
      setMessages([...updatedHistory, { role: 'assistant', content: "Connection error. Please try again.", suggestions: [] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          className="w-[420px] h-[560px] rounded-2xl border border-border bg-card flex flex-col overflow-hidden"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border" style={{ background: 'hsl(222, 47%, 11%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(160, 84%, 39%)' }}>
                <Sparkles className="w-4 h-4" style={{ color: 'white' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'hsl(210, 40%, 98%)' }}>EchoScope Intelligence Agent</h3>
                <p className="text-xs" style={{ color: 'hsl(215, 14%, 63%)' }}>Contextual analysis powered by AI</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-md transition-colors" style={{ color: 'hsl(215, 14%, 63%)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {rawResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Run a search first to load signal data into the agent's memory.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'hsl(160, 84%, 39%, 0.1)' }}>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Suggestion pills */}
                    {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && idx === messages.length - 1 && !isLoading && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => setInput(sug)}
                            className="px-3 py-1.5 text-xs rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'hsl(160, 84%, 39%, 0.1)' }}>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about engagement, entities, or signals..."
                disabled={rawResults.length === 0 || isLoading}
                className="echo-input flex-1"
              />
              <button
                type="submit"
                disabled={rawResults.length === 0 || isLoading || !input.trim()}
                className="echo-btn-accent p-2.5 rounded-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, hsl(222, 47%, 11%), hsl(217, 33%, 17%))',
          boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          color: 'white',
        }}
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default ChatBot;
