# YouTube Summary to PDF

This project provides an easy-to-use application for generating concise summaries of YouTube video transcripts and saving them as PDF files. It combines the power of Natural Language Processing (NLP) with a clean user interface for an intuitive user experience.

## Features

- **YouTube Video Summarization**: Extracts transcripts from YouTube videos and generates concise summaries.
- **PDF Generation**: Formats summaries into PDFs for easy sharing and archiving.
- **User-Friendly Interface**: Intuitive application interface for seamless usage.
- **Responsive Design**: Works well on both large and small screens.
- **Advanced NLP with LangChain and OpenAI LLM**: Utilizes LangChain for chaining NLP tasks and OpenAI's Large Language Models (LLM) for improved summarization accuracy.

---

## Tech Stack

- **Backend**: Python
- **Frontend**: React (for UI enhancements)
- **Libraries Used**:
  - `requests`: For API calls.
  - `beautifulsoup4`: For scraping transcripts if needed.
  - `nltk` / `spacy`: For NLP tasks.
  - `fpdf` or `reportlab`: For PDF generation.
  - `langchain`: For chaining NLP processes.
  - `openai`: For using OpenAI's GPT models.

---

## Installation and Setup

### Prerequisites

- Python 3.8 or higher installed on your machine.
- A valid YouTube Data API key.
- An OpenAI API key for LLM integration.

### Steps

1. Clone the repository:

   ```bash
   git clone -b NewVersion https://github.com/sounar97/Youtube-Summary-PDF.git
   cd Youtube-Summary-PDF
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

4. Set up API keys:

   Update the `.env` file with your YouTube Data API key and OpenAI API key or set them as environment variables.

5. Run the backend application:

   ```bash
   cd backend
   python app.py
   ```

6. Run the frontend application:

   ```bash
   cd frontend
   npm start
   ```

---


## Usage

1. **Launch the App**:
   Run the scripts to start the application interface.

2. **Input YouTube URL**:
   Enter the URL of the YouTube video you want summarized.

3. **Generate Summary**:
   Click the "Generate Summary" button to process the transcript using LangChain and OpenAI's LLM.

4. **Save as PDF**:
   View the summary and save it as a PDF file.

---

## Contributions

Contributions are welcome! Feel free to fork the repository and submit pull requests.



