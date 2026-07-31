# Remote Job Finder

A web application that helps job seekers discover live remote job openings by searching, filtering, and sorting real listings pulled from the Remotive job board API.

## Why this project

Most demo API projects (jokes, cat facts, weather) are novelties. This one solves an actual problem: finding relevant remote work quickly, without digging through a cluttered job board UI. Users can search by keyword, filter by category, and sort by recency or company — all live against real, current job postings.

## Features

- Live job listings fetched from the Remotive API
- Real-time search by job title, company, or location
- Filter by job category
- Sort by date posted (newest/oldest) or company name (A-Z)
- Combined filtering — search, category, and sort all work together simultaneously
- In-app job details modal (view full description without leaving the page)
- Graceful error handling for API downtime, network failures, and empty search results

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** HTML, CSS, vanilla JavaScript (no framework)
- **API:** [Remotive API](https://remotive.com/api-documentation) — free, no API key required
- **Config:** dotenv for environment variables
- **Process management:** pm2
- **Load balancing:** HAProxy

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

3. Create a `.env` file in the project root:PORT=5000


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

This application is deployed behind an HAProxy load balancer (Lb01), configured to distribute traffic across two web servers (Web01, Web02).

### Web Server Setup (Web01 & Web02)

Each web server runs the app identically:

1. SSH into the server:
```bash
   ssh -i your-key.pem ubuntu@<server-ip>
```

2. Install Node.js 20:
```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
   sudo apt-get install -y nodejs
```

3. Install git and pm2:
```bash
   sudo apt-get install -y git
   sudo npm install -g pm2
```

4. Clone the repository:
```bash
   git clone https://github.com/Sylvieu25/remote-job-finder.git
   cd remote-job-finder
   npm install
```

5. Create `.env`:
```bash
   echo "PORT=5000" > .env
```

6. Start the app with pm2 (keeps it running after disconnect, and across reboots):
```bash
   pm2 start server.js --name remote-job-finder
   pm2 startup systemd -u ubuntu --hp /home/ubuntu
   pm2 save
```

The app runs on port `5000` on each web server.

### Load Balancer Setup (Lb01)

HAProxy is configured to distribute traffic between Web01 and Web02 using round-robin, on port `8080`:

```text
frontend job_finder_front
bind *:8080
default_backend job_finder_back

backend job_finder_back
balance roundrobin
server 6996-web-01 <web01-ip>:5000 check
server 6996-web-02 <web02-ip>:5000 check
```


This block was added to `/etc/haproxy/haproxy.cfg` and applied with:

```bash
sudo haproxy -c -f /etc/haproxy/haproxy.cfg   # validate config
sudo systemctl reload haproxy                  # apply without downtime
```

HAProxy performs health checks (`check`) on each backend server. If a server goes down, HAProxy automatically stops routing traffic to it and sends all requests to the remaining healthy server(s) — no manual intervention needed.

### Accessing the Deployed App

- **Via load balancer (recommended):** http://3.83.160.39:8080
- **Directly on Web02:** http://100.27.23.115:5000
- **Web01:** Not currently accessible — the SSH key was never authorized on this server, despite working correctly on Web02 and Lb01 (same key). This is a server-side provisioning gap, not a key or setup issue (see Challenges below). The load balancer is fully configured to include Web01 and will automatically route traffic to it once access is restored — no config changes needed.

## Challenges & Solutions

- **SSH access to Web01 was unavailable** — the provided SSH key was not authorized on Web01's `authorized_keys`, despite working correctly on Web02 and Lb01 (verified via `ssh -v` showing the key was offered but rejected). This appears to be a server-side provisioning gap rather than a key issue. Deployment was completed on Web02, and the load balancer was configured to include Web01 in its backend pool — HAProxy's health checks will automatically route traffic to it as soon as it becomes reachable, with no config changes required.
- **No text editor (`nano`/`vim`) available on the minimal Ubuntu server images** — worked around this using `heredoc` syntax (`cat << 'EOF'`) piped through `tee -a` for files requiring `sudo`, avoiding the need to install an editor just for a couple of small config files.
- **Existing HAProxy configuration on Lb01** — Lb01 already had a load balancer configuration from a previous project (serving a different app on ports 80/443 with SSL). Rather than overwrite it, a separate `frontend`/`backend` block was added on port `8080`, keeping this project fully isolated from the prior one.

## Demo Video

[Watch the demo video](https://youtu.be/YJMty-GVlDQ)
