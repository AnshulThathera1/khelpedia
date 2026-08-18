"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, Loader2, Sparkles, Terminal } from "lucide-react";

// Simple markdown formatter since we don't have react-markdown installed
const formatText = (text) => {
    if (!text) return "";
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

export default function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', content: "Hello! I'm your KhelPediA Assistant. Ask me anything about esports, tournaments, players, or KhelPediA features!" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        
        // Add user message to UI
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Add an empty model message that we will stream into
            setMessages(prev => [...prev, { role: 'model', content: "" }]);

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!res.ok) throw new Error("Network response was not ok");

            // Read the stream
            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let modelResponse = "";
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                modelResponse += chunk;
                
                // Update the last message in the state with the new chunk
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content = modelResponse;
                    return newArr;
                });
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1].content = "Sorry, I'm having trouble connecting to the network right now. Please try again later.";
                return newArr;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <motion.button
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0a0e17] border border-[var(--accent-red)] text-white p-4 rounded-full shadow-[0_0_20px_rgba(255,70,85,0.3)] hover:shadow-[0_0_30px_rgba(255,70,85,0.6)] transition-all overflow-hidden group"
                style={{
                    display: isOpen ? "none" : "flex",
                }}
            >
                {/* Glossy overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Terminal className="w-6 h-6 text-[var(--accent-red)] relative z-10" />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: 50, scale: 0.9, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 50, scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-[#111] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0a0e17] to-[#111] border-b border-[var(--accent-red)]/30 relative">
                            {/* Accent line at top */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--accent-red)] to-transparent"></div>
                            
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-sm bg-[#1a1f2e] border border-white/10 flex items-center justify-center shadow-inner">
                                    <Terminal className="w-5 h-5 text-[var(--accent-red)]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white tracking-wider uppercase font-orbitron text-md flex items-center gap-2">
                                        KhelPediA AI <Sparkles className="w-3 h-3 text-yellow-400" />
                                    </h3>
                                    <p className="text-[10px] text-[var(--accent-red)] font-mono uppercase tracking-widest flex items-center gap-1 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)] animate-pulse"></span> System Active
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-white/40 hover:text-[var(--accent-red)] hover:bg-white/5 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[rgba(10,14,23,0.8)]">
                            {messages.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                                >
                                    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-white/10 rounded-full' : 'bg-[#1a1f2e] border border-[var(--accent-red)]/30 rounded-sm'}`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Terminal className="w-4 h-4 text-[var(--accent-red)]" />}
                                    </div>
                                    <div 
                                        className={`p-3 text-sm leading-relaxed ${
                                            msg.role === 'user' 
                                                ? 'bg-white/10 text-white rounded-2xl rounded-tr-sm' 
                                                : 'bg-gradient-to-b from-[#111] to-[#0a0e17] border border-white/10 text-[var(--text-secondary)] rounded-lg rounded-tl-none shadow-md'
                                        }`}
                                    >
                                        {formatText(msg.content)}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="self-start flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 bg-[#1a1f2e] border border-[var(--accent-red)]/30 rounded-sm flex items-center justify-center">
                                        <Terminal className="w-4 h-4 text-[var(--accent-red)]" />
                                    </div>
                                    <div className="p-3 bg-[#0a0e17] border border-white/5 rounded-lg rounded-tl-none flex items-center">
                                        <Loader2 className="w-4 h-4 text-[var(--accent-red)] animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-black/50 border-t border-white/5">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input 
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Access KhelPediA database..."
                                    className="flex-1 bg-[#1a1f2e] border border-white/10 rounded-sm px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--accent-red)] transition-colors font-mono placeholder:font-sans"
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="w-12 rounded-sm bg-[var(--accent-red)] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 transition-colors"
                                >
                                    <Send className="w-4 h-4 ml-[-2px]" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
