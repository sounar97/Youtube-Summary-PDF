import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [youtubeLink, setYoutubeLink] = useState('');
    const [summary, setSummary] = useState('');
    const [thumbnail, setThumbnail] = useState(''); // Add state for thumbnail
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Function to extract YouTube video ID
    const extractVideoId = (url) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.+\?v=|.*\/)([a-zA-Z0-9_-]{11})|(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? (match[1] || match[2]) : null;
    };

    const handleSummarize = async () => {
        if (!youtubeLink) {
            setError('Please enter a YouTube link');
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Get video ID
            const videoId = extractVideoId(youtubeLink);
            if (videoId) {
                const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                setThumbnail(thumbnailUrl); // Set thumbnail URL
            } else {
                setThumbnail('');
                setError('Invalid YouTube link');
            }

            const response = await axios.post('http://localhost:5000/summarize', {
                youtube_link: youtubeLink,
            });
            setSummary(response.data.summary);
        } catch (err) {
            setError('Error generating summary');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await axios.post('http://localhost:5000/download_pdf', {
                summary,
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'summary.pdf');
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            setError('Error downloading PDF');
        }
    };

    return (
      <div className="App">
          <h1>YouTube Transcript to Detailed Notes Converter</h1>
          <input
              type="text"
              placeholder="Enter YouTube Video Link"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
          />
          <button onClick={handleSummarize} disabled={loading}>
              {loading ? 'Processing...' : 'Get Detailed Notes'}
          </button>
          
         
          {thumbnail && (
              <div>
                  <h2>Video Thumbnail:</h2>
                  <img src={thumbnail} alt="YouTube Thumbnail" />
              </div>
          )}
          
          
          {summary && (
              <div>
                  <h2>Summary:</h2>
                  <p>{summary}</p>
                  <button onClick={handleDownloadPDF}>Download as PDF</button>
              </div>
          )}
          
          {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
  );
  
}

export default App;
