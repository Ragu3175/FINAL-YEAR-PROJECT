import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { chatResponses } from '../../data/mockData';
import { sendMessage as sendChatMessage } from '../../services/chatService';
import './ChatAssistant.css';

const ChatAssistant = ({ role = 'user' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: role === 'user' ? chatResponses.user : chatResponses.admin, sender: 'assistant' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsgText = input.trim();
        const userMsg = { id: Date.now(), text: userMsgText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const reply = await sendChatMessage(userMsgText);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: reply,
                sender: 'assistant'
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting to the AI. Please make sure the API key is set correctly in the backend.",
                sender: 'assistant',
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
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
                            <div key={msg.id} className={`message-bubble ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-bubble assistant loading">
                                <Loader2 className="animate-spin" size={16} />
                                <span>Assistant is thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder={isLoading ? "Please wait..." : "Type a message..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={!input.trim() || isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatAssistant;
