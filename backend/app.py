import os
from flask import Flask, jsonify, request, send_file
from googleapiclient.discovery import build
import openai
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_openai import OpenAI
from flask_cors import CORS
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from dotenv import load_dotenv  # Import dotenv to load the environment variables

# Load environment variables from the .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize OpenAI API key and YouTube Data API key from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")
youtube_api_key = os.getenv("YOUTUBE_API_KEY")

# Function to search YouTube videos directly using YouTube Data API v3
def search_youtube_videos(query):
    youtube = build("youtube", "v3", developerKey=youtube_api_key)
    
    # Search for videos using the query
    search_response = youtube.search().list(
        q=query,                # The query string to search for
        part="snippet",         # The part we need (snippet contains title, description, etc.)
        maxResults=5            # Limit results to top 5
    ).execute()

    videos = []
    for item in search_response.get("items", []):
        # Check if the item is a video (the 'id' type should be 'video')
        if item["id"]["kind"] == "youtube#video":
            video_info = {
                "title": item["snippet"]["title"],
                "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                "description": item["snippet"].get("description", ""),
                "thumbnail": item["snippet"]["thumbnails"]["default"]["url"]  # Add thumbnail URL
            }
            videos.append(video_info)

    return videos

# Function to create LangChain summarizer
def create_summarizer():
    template = """You are a YouTube video summary assistant. You are given a list of video titles and URLs.
    Your job is to provide a brief summary of each video in 250 words, explaining its content and key takeaways.

    Videos:
    {videos}

    Please provide a summary for the above videos.
    """
    prompt = PromptTemplate(input_variables=["videos"], template=template)
    llm = OpenAI(openai_api_key=openai.api_key)  # Use LangChain's OpenAI integration
    chain = LLMChain(llm=llm, prompt=prompt)
    return chain

# Route to search for YouTube videos
@app.route("/api/search", methods=["POST"])
def search_videos():
    data = request.get_json()
    query = data.get("query", "")
    
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    # Search YouTube
    videos = search_youtube_videos(query)
    
    if not videos:
        return jsonify({"error": "No videos found"}), 404

    return jsonify({"videos": videos})

# Updated route to handle both summary and PDF download
@app.route("/api/summarize", methods=["POST"])
def summarize_video():
    data = request.get_json()
    video_url = data.get("videoUrl", "")
    download_pdf = data.get("downloadPdf", False)  # Check if PDF download is requested
    
    if not video_url:
        return jsonify({"error": "Video URL is required"}), 400

    # Create the summarizer chain
    summarizer = create_summarizer()

    # Fetch the video title from the URL (using YouTube API)
    video_id = video_url.split("v=")[-1]  # Extract video ID from URL
    youtube = build("youtube", "v3", developerKey=youtube_api_key)
    video_response = youtube.videos().list(
        part="snippet", 
        id=video_id
    ).execute()

    if not video_response["items"]:
        return jsonify({"error": "Video not found"}), 404

    video_title = video_response["items"][0]["snippet"]["title"]

    # Get the summary for the single video
    summary = summarizer.run({"videos": video_title})

    # Check if summary is valid
    if not summary:
        return jsonify({"error": "Failed to generate summary"}), 500

    if download_pdf:
        # Generate PDF for the summary
        pdf_file = generate_pdf(summary)
        return send_file(pdf_file, as_attachment=True, download_name="video_summary.pdf", mimetype="application/pdf")

    # Return summary as JSON
    return jsonify({"summary": summary})

# Function to generate PDF for video summary
def generate_pdf(summary):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Set title and content
    c.setFont("Helvetica", 12)
    c.drawString(100, height - 40, "Video Summary:")
    text = c.beginText(100, height - 60)
    text.setFont("Helvetica", 10)
    text.setTextOrigin(100, height - 60)

    # Wrap text to avoid overflowing on the PDF
    lines = wrap_text(summary, width - 200)
    for line in lines:
        text.textLine(line)

    c.drawText(text)
    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer

# Helper function to wrap text for PDF generation
def wrap_text(text, max_width):
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    import textwrap

    # Initialize a canvas object to get text width
    wrapper = textwrap.TextWrapper(width=max_width // 6)  # Adjust based on font size
    return wrapper.wrap(text)

if __name__ == "__main__":
    app.run(debug=True)