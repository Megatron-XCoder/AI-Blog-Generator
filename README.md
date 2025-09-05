AI-Powered Blog Generator
=========================

Transform ideas into engaging, professional blog posts in seconds.\
This web app leverages **Google's Gemini AI** to generate ~1000-word, well-structured, and SEO-friendly blog posts from simple text prompts.

* * * * *

✨ Features
----------

-   **Professional Quality** -- Generate structured, natural, and engaging blog posts that read like they were written by an expert.

-   **Lightning Fast** -- Get complete 1000-word blogs in seconds instead of hours. Perfect for busy creators.

-   **AI-Powered** -- Built on Google's advanced **Gemini** models for contextual and relevant content.

-   **Customizable** -- Adjust tone, creativity, and target word count.

-   **User-Friendly** -- Minimal design with prompt input, example prompts, and copy/download options.

* * * * *

🚀 Demo Workflow
----------------

1.  **Describe your topic**\
    Example: *"The benefits of meditation for busy professionals."*

2.  **Press `Generate Blog` (or `Ctrl+Enter`)**\
    The app calls Gemini's `generateContent` endpoint with your prompt.

3.  **View your blog post**

    -   Automatically formatted with headings, summary, table of contents, lists, examples, and conclusion.

    -   Copy the HTML or download it as a file.

* * * * *

📦 Installation & Setup
-----------------------

1.  Clone this repo:

    `git clone https://github.com/your-username/ai-blog-generator.git
    cd ai-blog-generator`

2.  Open the project in your editor.

3.  Provide your **Gemini API Key**:

    -   Sign up at Google AI Studio.

    -   Get your free API key.

    -   Enter the key in the app input field (or save in localStorage).

4.  Run locally by opening `index.html` in your browser.

* * * * *

🔑 API Usage
------------

This project uses Google's Generative Language API (`gemini-1.5-flash-latest` by default).

**Example Request**:

```bash 
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=YOUR_API_KEY
Content-Type: application/json

{
  "contents": [{
    "parts": [{ "text": "Write a 1000-word blog about sustainable living and eco-friendly practices." }]
  }],
  "generationConfig": {
    "maxOutputTokens": 8192,
    "temperature": 0.7,
    "topP": 0.9
  }
}
```

* * * * *

💡 Example Prompts
------------------

-   *Write about the future of artificial intelligence and its impact on society*

-   *Explore the benefits of sustainable living and eco-friendly practices*

-   *Discuss the importance of mental health in the digital age*

-   *The rise of remote work and its effects on productivity and work-life balance*

* * * * *

📝 Tips for Better Results
--------------------------

-   **Be specific** -- Include details about audience, tone, and key points.

-   **Provide context** -- Mention background info or trends.

-   **Set the tone** -- Indicate if you want it formal, casual, persuasive, or storytelling.

* * * * *

⚠️ Security Note
----------------

For demonstration, this app directly calls Gemini API from the browser.\
**This exposes your API key.**\
👉 For production, **proxy API requests through your own backend** and keep the key server-side.