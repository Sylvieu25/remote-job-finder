require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static frontend files (index.html, style.css, app.js) from /public
app.use(express.static('public'));

// New endpoint: fetches live remote job listings from Remotive
app.get('/api/jobs', async (req, res) => {
  try {
    const response = await fetch('https://remotive.com/api/remote-jobs');

    if (!response.ok) {
      // Remotive responded, but with an error status (e.g. 500, 503)
      return res.status(502).json({
        error: 'Failed to fetch jobs from Remotive API',
        status: response.status
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    // Network failure, DNS issue, Remotive completely down, etc.
    console.error('Error fetching jobs:', err.message);
    res.status(500).json({
      error: 'Something went wrong while fetching job listings. Please try again later.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
