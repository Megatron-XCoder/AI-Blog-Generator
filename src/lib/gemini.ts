interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function generateBlogPost(prompt: string, apiKey: string): Promise<string> {
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  
  const requestBody = {
    contents: [{
      parts: [{
        text: `You are a professional blog writer. Write a comprehensive, well-structured, and engaging 1000-word blog post about: "${prompt}"

Please follow these guidelines:
- Start with an engaging title
- Create a compelling introduction that hooks the reader
- Use clear headings and subheadings to organize content
- Write in a conversational yet professional tone
- Include practical examples, insights, or actionable advice
- Use proper paragraph breaks for readability
- End with a strong conclusion that summarizes key points
- Make it informative, valuable, and engaging for readers
- Aim for approximately 1000 words

Format the output with proper markdown headings (# for main title, ## for sections, ### for subsections) and ensure good flow between paragraphs.`
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      
      if (response.status === 400) {
        throw new Error('Invalid API key or request format. Please check your Gemini API key.');
      } else if (response.status === 403) {
        throw new Error('API access denied. Please verify your Gemini API key has the required permissions.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      } else {
        throw new Error(`API request failed: ${response.status}`);
      }
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No content generated. Please try a different prompt.');
    }

    const generatedText = data.candidates[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('Empty response from Gemini API. Please try again.');
    }

    return generatedText;
  } catch (error) {
    console.error('Error generating blog post:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to generate blog post. Please check your internet connection and try again.');
  }
}