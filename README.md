# AI Text Summarizer

## Summary

AI Text Summarizer is a powerful web application that leverages advanced AI models to transform lengthy documents, articles, and text content into concise, meaningful summaries. The application provides a secure, user-friendly interface where authenticated users can:

- Input text directly or upload documents (PDF, DOCX, TXT formats)
- Extract and summarize content from web URLs
- Choose between different AI models (Llama 3.2, DeepSeek R1)
- Customize summary length (Small, Medium, Large, or Custom word count)
- Select summary styles (Professional, Academic, Simple, Bullet Points, Executive Summary)
- Download generated summaries as Markdown files

The application features robust authentication to ensure secure access, session management for user persistence, and real-time processing indicators for a smooth user experience.

## Tech Stack

### Frontend
- **Streamlit** - Python-based web application framework for creating interactive data applications

### Backend
- **Python 3.8+** - Core programming language
- **LangChain** - Framework for developing applications powered by language models
- **Ollama** - Local AI model hosting and inference

### AI Models
- **Llama 3.2** - Compact and efficient language model
- **DeepSeek R1** - Advanced reasoning model for comprehensive summaries

### Security
- **bcrypt** - Password hashing and verification
- **Cookie-based sessions** - Secure session management with configurable expiry