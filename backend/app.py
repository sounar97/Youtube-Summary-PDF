from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import os
import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi
from fpdf import FPDF
import io

app = Flask(__name__)
CORS(app)  
load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

prompt = """You are YouTube video summarizer. You will be taking the transcript text
and summarizing the entire video and providing the important summary in points
within 250 words. Please provide the summary of the text given here:  """

def extract_transcript_details(youtube_video_url):
    try:
        video_id = youtube_video_url.split("=")[1]
        transcript_text = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = ""
        for i in transcript_text:
            transcript += " " + i["text"]
        return transcript
    except Exception as e:
        return str(e)

def generate_gemini_content(transcript_text, prompt):
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content(prompt + transcript_text)
    return response.text

def create_pdf(summary):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, summary)
    return pdf

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    youtube_link = data.get('youtube_link')
    transcript_text = extract_transcript_details(youtube_link)
    if transcript_text:
        summary = generate_gemini_content(transcript_text, prompt)
        return jsonify({"summary": summary})
    else:
        return jsonify({"error": "Could not extract transcript"}), 400

@app.route('/download_pdf', methods=['POST'])
def download_pdf():
    data = request.json
    summary = data.get('summary')
    pdf = create_pdf(summary)
    pdf_output = pdf.output(dest='S').encode('latin1')

    return send_file(
        io.BytesIO(pdf_output),
        mimetype='application/pdf',
        as_attachment=True,
        download_name='summary.pdf'
    )

if __name__ == '__main__':
    app.run(debug=True)
