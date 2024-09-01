import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [youtubeLink, setYoutubeLink] = useState('');
    const [summary, setSummary] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            const videoId = extractVideoId(youtubeLink);
            if (videoId) {
                const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                setThumbnail(thumbnailUrl);
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
        <div className="bg-lightPink min-h-screen">
            <nav className="bg-black text-white p-4 flex justify-between items-center">
                <div className="text-xl font-bold">YouTube Summarizer</div>
                <div>
                    <a href="#home" className="mx-2">HOME</a>
                    <a href="#howto" className="mx-2">HOW TO DO IT</a>
                </div>
            </nav>

            <div id="home" className="flex flex-col items-center justify-center mt-16">
                <h1 className="text-3xl font-bold text-center mb-8">YouTube Video Summarizer</h1>
                <input
                    type="text"
                    placeholder="Enter YouTube Video Link"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    className="border-2 border-black rounded p-2 w-1/2 mb-4"
                />
                <button
                    onClick={handleSummarize}
                    disabled={loading}
                    className="bg-black text-white px-6 py-2 rounded"
                >
                    {loading ? 'Processing...' : 'Generate Summary'}
                </button>

                {thumbnail && (
                    <div className="mt-8">
                        <img src={thumbnail} alt="YouTube Thumbnail" className="w-64 h-auto rounded" />
                    </div>
                )}

                {summary && (
                    <div className="mt-8 p-4 border-2 border-black rounded w-3/4 bg-white">
                        <h2 className="text-2xl font-bold">Summary:</h2>
                        <p className="mt-4">{summary}</p>
                        <button
                            onClick={handleDownloadPDF}
                            className="bg-black text-white px-6 py-2 rounded mt-4"
                        >
                            Download as PDF
                        </button>
                    </div>
                )}

                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>

            <div id="howto" className="bg-lightBlue mt-16 p-8">
                <h2 className="text-2xl font-bold text-center mb-8">How to Use</h2>
                <div className="flex justify-around">
                    <div className="bg-white p-4 rounded shadow-md max-w-xs">
                        <h3 className="text-xl font-semibold mb-2">Step 1</h3>
                        <p>Enter the YouTube video link in the input field.</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow-md max-w-xs">
                        <h3 className="text-xl font-semibold mb-2">Step 2</h3>
                        <p>Click on the 'Generate Summary' button to get the video summary.</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow-md max-w-xs">
                        <h3 className="text-xl font-semibold mb-2">Step 3</h3>
                        <p>Download the summary as a PDF using the 'Download as PDF' button.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
