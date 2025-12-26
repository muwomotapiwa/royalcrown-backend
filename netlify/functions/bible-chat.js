const axios = require('axios');

exports.handler = async function(event, context) {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://your-username.github.io', // REPLACE with your GitHub Pages URL
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://your-username.github.io'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    // Make the API call to OpenRouter
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: "system",
          content: "You are RoyalCrown AI, a Bible study companion. You provide thoughtful, respectful, and theologically sound explanations of Scripture. You reference specific Bible verses when appropriate, explain cultural/historical context, and offer practical applications for modern life. You speak with wisdom, humility, and encouragement, always pointing toward God's love and truth. Format your responses with clear paragraphs, include relevant Scripture references in bold, and end with a brief blessing or encouragement."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-username.github.io', // REPLACE with your GitHub Pages URL
        'X-Title': 'RoyalCrown AI Bible Study'
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://your-username.github.io' // REPLACE with your GitHub Pages URL
      },
      body: JSON.stringify({
        response: response.data.choices[0].message.content,
        usage: response.data.usage || null
      })
    };

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);

    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://your-username.github.io'
      },
      body: JSON.stringify({
        error: error.response?.data?.error?.message || error.message || 'Something went wrong'
      })
    };
  }
};