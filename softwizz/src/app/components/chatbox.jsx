// src/components/ChatBox.js
'use client'
import { useState } from 'react';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    // Add the user message to the chat
    setMessages([...messages, { sender: 'user', text: input }]);

    // Send message to Ollama API and get response
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ollama', text: data.reply },
      ]);
      setInput(''); // Clear input field
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="chatbox">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSendMessage}>Send</button>

      <style jsx>{`
        .chatbox {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 20px;
          border: 1px solid #ccc;
          width: 300px;
          height: 400px;
          background-color: #f9f9f9;
        }
        .messages {
          flex-grow: 1;
          overflow-y: auto;
        }
        .user {
          text-align: right;
        }
        .ollama {
          text-align: left;
        }
        input {
          margin-top: 10px;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
        button {
          margin-top: 10px;
          padding: 10px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
};

export default ChatBox;
