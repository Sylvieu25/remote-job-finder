# Remote Job Finder

A web application that helps job seekers discover live remote job openings by searching, filtering, and sorting real listings pulled from the Remotive job board API.

## Why this project

Most demo API projects (jokes, cat facts, weather) are novelties. This one solves an actual problem: finding relevant remote work quickly, without digging through a cluttered job board UI. Users can search by keyword, filter by category, and sort by recency or company — all live against real, current job postings.

## Features

- Live job listings fetched from the Remotive API
- Real-time search by job title/keyword
- Filter by job category
- Sort by date posted (newest/oldest) or company name (A-Z)
- Combined filtering — search, category, and sort all work together simultaneously
- Graceful error handling for API downtime, network failures, and empty search results

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** HTML, CSS, vanilla JavaScript (no framework)
- **API:** [Remotive API](https://remotive.com/api-documentation) — free, no API key required
- **Config:** dotenv for environment variables

## Running Locally

### Prerequisites
- Node.js (v18+) and npm installed

### Setup

1. Clone the repository:
```bash
   git clone https://github.com/Sylvieu25/remote-job-finder.git
   cd remote-job-finder
```

2. Install dependencies:
```bash
   npm install
```

3. Create a `.env` file in the project root:
PORT=5000


4. Start the server:
```bash
   npm start
```
   (Or `npm run dev` for auto-restart during development.)

5. Open your browser to:

http://localhost:5000


## API Credit

This project uses the [Remotive API](https://remotive.com/api-documentation) to fetch live remote job listings. All job data, descriptions, and application links belong to Remotive and the respective employers. Full credit to the Remotive team for providing free, open access to this data.

## Architecture Note: API Key Security

Even though the Remotive API doesn't require an API key, this project is structured as if it did: all external API calls happen server-side (in `server.js`), never directly from the browser. This means the frontend only ever talks to this app's own `/api/jobs` endpoint, keeping any future API credentials safely out of client-side code and out of the public repository (enforced via `.gitignore`).

## Deployment

*[To be completed in Phase 2 — deployment instructions for Web01, Web02, and Lb01, including load balancer configuration]*

## Challenges & Solutions

*[To be completed — will document real challenges encountered during build/deploy]*

## Demo Video

*[Link to be added once recorded]*

## Live Deployment

*[Load balancer URL to be added once deployed]*
