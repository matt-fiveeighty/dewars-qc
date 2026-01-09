'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatBot({ show, onToggle }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hey! 👋 I'm your Dewar's Brand Maven. I can help with brand questions, spitball creative ideas, dig into our heritage, or just chat about whisky. What's on your mind?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (show) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [show]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Connect to your ChatGPT Brand Maven API
      console.log('Sending to Brand Maven:', userMessage.content);
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Placeholder response
      const response = {
        id: Date.now() + 1,
        role: 'assistant',
        content: getPlaceholderResponse(userMessage.content)
      };
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Chat failed:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Try again in a moment?"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder responses until API connected
  const getPlaceholderResponse = (input) => {
    const lower = input.toLowerCase();
    
    if (lower.includes('color') || lower.includes('palette')) {
      return "Great question! Our core brand colors are:\n\n• **Whiskey Brown** (#AD3826) - our signature color\n• **Warm White** (#FFF9F4) - for backgrounds and contrast\n• **Blue Black** (#101921) - for text and accents\n\nAlways use warm tones - never cool blues or grays on the product!";
    }
    
    if (lower.includes('font') || lower.includes('typography')) {
      return "For typography, we use:\n\n• **TT Fors** - Headlines and subheads (bold, confident)\n• **Futura PT Book** - Body copy and legal text\n\nKeep hierarchy clean: headlines should be 2-3x body size, subheads around 60-70% of headline.";
    }
    
    if (lower.includes('logo')) {
      return "Logo guidelines are crucial:\n\n• Minimum size: 150px wide\n• Clear space: height of the lowercase 's' in Dewar's on all sides\n• Never rotate, stretch, or modify\n• Position: right 50% (landscape) or bottom 50% (portrait)";
    }
    
    if (lower.includes('history') || lower.includes('heritage') || lower.includes('story')) {
      return "Dewar's has an incredible 178+ year heritage! Founded in 1846 by John Dewar in Perth, Scotland. His sons Tommy and John Alexander built it into a global brand. Fun fact: Tommy was one of the first marketers to use film for advertising!\n\nWant me to dig deeper into any part of our history?";
    }
    
    if (lower.includes('cocktail') || lower.includes('recipe') || lower.includes('drink')) {
      return "Love talking cocktails! Some classics with Dewar's:\n\n🥃 **Highball** - Dewar's 12, soda, lemon twist\n🍋 **Whisky Sour** - Dewar's, lemon, simple, egg white\n🧊 **Old Fashioned** - Dewar's 12, sugar, bitters, orange\n\nWant the full recipe for any of these?";
    }
    
    return "I'm your Dewar's Brand Maven, but I'm currently running in demo mode. Once connected to the full Brand Maven API, I'll be able to help with:\n\n• Deep brand guideline questions\n• Creative brainstorming\n• Heritage and history\n• Product knowledge\n• Cocktail recipes\n• Campaign ideas\n\nWhat would you like to explore?";
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: 'Brand Colors', query: 'What are our brand colors?' },
    { label: 'Typography', query: 'What fonts do we use?' },
    { label: 'Logo Rules', query: 'Tell me about logo guidelines' },
    { label: 'Our History', query: 'Tell me about Dewar\'s history' },
  ];

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      right: '30px',
      width: '380px',
      height: '500px',
      background: '#1a1a1a',
      borderRadius: '16px',
      border: '1px solid #3a3a3a',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: '#AD3826',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          🥃
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '15px' }}>Brand Maven</div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>Your Dewar's AI assistant</div>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? '#AD3826' : '#2a2a2a',
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px 16px 16px 4px',
              background: '#2a2a2a',
              display: 'flex',
              gap: '4px'
            }}>
              <span style={{ animation: 'bounce 1s infinite' }}>•</span>
              <span style={{ animation: 'bounce 1s infinite 0.2s' }}>•</span>
              <span style={{ animation: 'bounce 1s infinite 0.4s' }}>•</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div style={{
          padding: '0 16px 12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {quickActions.map(action => (
            <button
              key={action.label}
              onClick={() => {
                setInput(action.query);
                setTimeout(() => sendMessage(), 100);
              }}
              style={{
                background: '#2a2a2a',
                border: '1px solid #3a3a3a',
                color: '#ccc',
                padding: '8px 12px',
                borderRadius: '16px',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#AD3826';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#3a3a3a';
                e.currentTarget.style.color = '#ccc';
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #3a3a3a',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about Dewar's..."
          style={{
            flex: 1,
            background: '#2a2a2a',
            border: '1px solid #3a3a3a',
            borderRadius: '20px',
            padding: '10px 16px',
            color: 'white',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          style={{
            background: input.trim() && !isLoading ? '#AD3826' : '#3a3a3a',
            border: 'none',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ↑
        </button>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
