// AI-USAGE SUMMARY
// Tools: Claude, ChatGPT
// Overall AI Contribution: ~55%
// AI-Assisted Areas: chat UI structure, message state, scroll behavior
// Human Contributions: role integration, styling decisions, API wiring, testing
// Notes: reusable across PatientPortal, CoordinatorDashboard, DirectorDashboard
//        role prop controls prompt behavior in the AI service

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';

function AIChatWidget({ role, patientContext = {} }) {
  /*
   * State explanation:
   * messages — array of {role: 'user'|'assistant', text: string}
   * input — current text in the input box
   * loading — true while waiting for AI response
   * open — whether the chat panel is visible
   */
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: getWelcomeMessage(role)
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message every time messages updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getWelcomeMessage(role) {
    if (role === 'COORDINATOR') return 'Hi! I can help with patient management and workflow questions.';
    if (role === 'PROGRAM_DIRECTOR') return 'Hi! I can help with program metrics and performance insights.';
    return 'Hi! I can answer questions about your bariatric care journey.';
  }

  function getSuggestedQuestions(role) {
    if (role === 'COORDINATOR') return [
      'How do I update insurance status?',
      'What clinical fields are required?',
    ];
    if (role === 'PROGRAM_DIRECTOR') return [
      'What metrics should I track?',
      'How do I identify bottlenecks?',
    ];
    return [
      'What does my insurance status mean?',
      'What is my next step?',
    ];
  }

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question) return;

    // Add user message to chat immediately
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const data = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          question,
          patient_id: user?.id || 0,
          patient_context: patientContext,
          role: role
        })
      });

      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, I could not process your question right now. Please try again or contact your coordinator.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button to open/close */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#0d6efd',
          color: 'white',
          border: 'none',
          fontSize: '1.4rem',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
        }}
        title="AI Assistant"
      >
        {open ? <i className="bi bi-x-lg" /> : <i className="bi bi-chat-dots-fill" />}      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '360px',
          height: '480px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            backgroundColor: '#0d6efd',
            color: 'white',
            padding: '12px 16px',
            fontWeight: '600',
            fontSize: '0.95rem',
          }}>
            BariatricPath AI Assistant
          </div>

          {/* Messages area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? '#0d6efd' : '#f1f3f5',
                color: msg.role === 'user' ? 'white' : '#333',
                padding: '8px 12px',
                borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                maxWidth: '80%',
                fontSize: '0.875rem',
                lineHeight: '1.5',
              }}>
                {msg.text}
              </div>
            ))}

            {/* Loading dots while waiting */}
            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: '#f1f3f5',
                padding: '8px 12px',
                borderRadius: '12px 12px 12px 0',
                fontSize: '0.875rem',
                color: '#666',
              }}>
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions — only shown at start */}
          {messages.length === 1 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {getSuggestedQuestions(role).map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    border: '1px solid #0d6efd',
                    backgroundColor: 'white',
                    color: '#0d6efd',
                    cursor: 'pointer',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '8px',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                padding: '8px 14px',
                backgroundColor: '#0d6efd',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatWidget;