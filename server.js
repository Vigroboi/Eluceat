require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');

if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set.');
    console.error('Add your OpenAI API key to the .env file.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static site files
app.use(express.static(path.join(__dirname)));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI assistant for Eluceat, a web design and digital services company. 
Eluceat provides web design, software development, brand promotion, site security, and digital marketing services.
Be helpful, professional, and concise. Answer questions about Eluceat's services, pricing enquiries (direct to the contact page), 
and general web/tech questions. If you don't know something specific about Eluceat's internal details, 
suggest the user contact the team directly via the Contact page.`;

app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    const isValidMessage = (m) =>
        m && typeof m === 'object' &&
        typeof m.role === 'string' && ['user', 'assistant', 'system'].includes(m.role) &&
        typeof m.content === 'string' && m.content.trim().length > 0;

    if (!messages.every(isValidMessage)) {
        return res.status(400).json({ error: 'Invalid request: each message must have a valid role and content' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages,
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error('OpenAI API error:', error.message);
        res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
    }
});

app.listen(PORT, () => {
    console.log(`Eluceat AI server running on http://localhost:${PORT}`);
});
