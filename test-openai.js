// Simple script to test OpenAI API key
import dotenv from 'dotenv';
dotenv.config();

const openAIApiKey = process.env.OPENAI_API_KEY;
console.log('Using OpenAI API Key:', openAIApiKey.substring(0, 10) + '...');

async function testOpenAIKey() {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello, this is a test message." }],
        max_tokens: 10
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Error details:', data.error);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testOpenAIKey();
