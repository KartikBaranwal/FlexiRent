"use client";

import { useState } from "react";

export default function ChatPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    const handleChat = async () => {
        if (!input) return;

        // Show user message
        setMessages((prev) => [...prev, "You: " + input]);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: input })
            });

            const data = await res.json();

            console.log("API RESPONSE:", data);

            // Show bot response
            setMessages((prev) => [...prev, "Bot: " + data.reply]);

        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, "Bot: Error occurred"]);
        }

        setInput("");
    };

    return (
        <div style={{ padding: "40px", color: "white" }}>

            <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
                AI Chatbot 🤖
            </h1>

            {/* CHAT BOX */}
            <div
                style={{
                    background: "#1e293b",
                    padding: "20px",
                    borderRadius: "10px",
                    minHeight: "300px",
                    marginBottom: "20px"
                }}
            >
                {messages.length === 0 && (
                    <p style={{ color: "#94a3b8" }}>
                        Start chatting...
                    </p>
                )}

                {messages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: "10px" }}>
                        {msg}
                    </div>
                ))}
            </div>

            {/* INPUT + BUTTON */}
            <div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    style={{
                        padding: "10px",
                        width: "70%",
                        marginRight: "10px",
                        color: "black"
                    }}
                />

                <button
                    onClick={handleChat}
                    style={{
                        padding: "10px 20px",
                        cursor: "pointer"
                    }}
                >
                    Send
                </button>
            </div>

        </div>
    );
}