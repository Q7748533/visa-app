// 测试 AI API 连接
async function testAIAPI() {
  const API_KEY = 'sk-AfIqJmvAVTdKk5TbQM4GbEP2uXlEfJcld5R3FbSTKBEFxOsT';
  const API_URL = 'https://api.vectorengine.ai/v1/chat/completions';
  const MODEL = 'gemini-3.1-pro-preview';

  console.log('Testing AI API...');
  console.log('URL:', API_URL);
  console.log('Model:', MODEL);
  console.log('API Key (前10位):', API_KEY.substring(0, 10) + '...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test. Please respond with "API is working"',
          },
        ],
        temperature: 0.3,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));

    const text = await response.text();
    console.log('Response body (first 500 chars):', text.substring(0, 500));

    if (!response.ok) {
      console.error('API request failed:', response.status);
      return;
    }

    try {
      const data = JSON.parse(text);
      console.log('Parsed response:', JSON.stringify(data, null, 2));
      console.log('AI Response:', data.choices?.[0]?.message?.content);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testAIAPI();
