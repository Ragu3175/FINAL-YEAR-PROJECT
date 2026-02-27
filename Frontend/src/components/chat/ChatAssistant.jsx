import React, { useState } from 'react';
import { MessageSquare, Send, X, ChevronUp, ChevronDown } from 'lucide-react';
import { chatResponses } from '../../data/mockData';
import './ChatAssistant.css';

const ChatAssistant = ({ role = 'user' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: role === 'user' ? chatResponses.user : chatResponses.admin, sender: 'assistant' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages([...messages, userMsg]);
        setInput('');

        // Simulate response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I am processing your request. This is a placeholder response.",
                sender: 'assistant'
            }]);
        }, 1000);
    };

    return (
        <div className={`chat-wrapper ${isOpen ? 'open' : ''}`}>
            {!isOpen ? (
                <button className="chat-toggle" onClick={() => setIsOpen(true)}>
                    <MessageSquare size={24} />
                    <span>Assistant</span>
                </button>
            ) : (
                <div className="chat-panel card">
                    <div className="chat-header">
                        <div className="header-info">
                            <MessageSquare size={20} />
                            <span>SafeDrive AI Assistant</span>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <form className="chat-input" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={!input.trim()}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatAssistant;
