// src/pages/api/chat.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { message } = req.body;
  
      try {
        // You can adjust the following based on how your Ollama is set up
        const response = await fetch('http://localhost:5000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: message }),
        });
  
        const data = await response.json();
        res.status(200).json({ reply: data.reply });
      } catch (error) {
        res.status(500).json({ error: 'Error communicating with Ollama' });
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  