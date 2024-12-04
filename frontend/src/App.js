import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';  // Import react-markdown

function App() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle topic search
  const handleSearch = async () => {
    if (!query) return;

    setLoading(true);
    setSummary(''); // Clear summary on new search
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/search', { query });
      setVideos(response.data.videos); // Assuming 'videos' is returned in the response
      setLoading(false);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setLoading(false);
    }
  };

  // Handle video selection for summarization
  const handleSummarize = async (videoUrl) => {
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/summarize', { videoUrl, downloadPdf: false });
      setSummary(response.data.summary);  // Store the summary as plain text
      setLoading(false);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setLoading(false);
    }
  };

  // Handle PDF download
  const handleDownloadPDF = async (videoUrl) => {
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/summarize', { videoUrl, downloadPdf: true }, { responseType: 'blob' });
      // Create a temporary download link for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'video_summary.pdf';
      link.click();
      setLoading(false);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">YouTube Video Summarizer</h1>

        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter topic"
          />
          <button
            onClick={handleSearch}
            className="mt-2 w-full bg-blue-500 text-white p-2 rounded-md"
          >
            Search Videos
          </button>
        </div>

        {/* Video list */}
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div>
            {videos.length > 0 && (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.url} className="flex items-center space-x-4 border-b pb-4">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-16 h-16 rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{video.title}</h3>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        Watch Video
                      </a>
                    </div>
                    <button
                      onClick={() => handleSummarize(video.url)}
                      className="bg-green-500 text-white p-2 rounded-md"
                    >
                      Summarize
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Display video summary */}
            {summary && (
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <h2 className="text-lg font-bold mb-2">Summary</h2>
                <ReactMarkdown>{summary}</ReactMarkdown>  {/* Render summary as markdown */}
                
                {/* Button to download PDF */}
                <button
                  onClick={() => handleDownloadPDF(videos[0].url)} // Pass the first video URL
                  className="mt-4 bg-yellow-500 text-white p-2 rounded-md"
                >
                  Download as PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
