const statusEl = document.getElementById('status');
const jobListEl = document.getElementById('jobList');
const categoryFilterEl = document.getElementById('categoryFilter');

let allJobs = []; // we'll keep the full dataset here so search/filter/sort can work on it later

async function loadJobs() {
  statusEl.textContent = 'Loading jobs...';

  try {
    const response = await fetch('/api/jobs');

    if (!response.ok) {
      statusEl.textContent = 'Could not load jobs right now. Please try again later.';
      return;
    }

    const data = await response.json();
    allJobs = data.jobs || [];

    if (allJobs.length === 0) {
      statusEl.textContent = 'No jobs found.';
      return;
    }

    statusEl.textContent = `Showing ${allJobs.length} jobs`;
    populateCategoryFilter(allJobs);
    renderJobs(allJobs);

  } catch (err) {
    console.error('Error loading jobs:', err);
    statusEl.textContent = 'Something went wrong. Check your connection and try again.';
  }
}

function populateCategoryFilter(jobs) {
  const categories = [...new Set(jobs.map(job => job.category))].sort();

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilterEl.appendChild(option);
  });
}

function renderJobs(jobs) {
  jobListEl.innerHTML = '';

  jobs.forEach(job => {
    const card = document.createElement('div');
    card.className = 'job-card';

    card.innerHTML = `
      <h3>${job.title}</h3>
      <p class="company">${job.company_name} — ${job.candidate_required_location}</p>
      <p class="category">${job.category}</p>
      <p class="date">Posted: ${new Date(job.publication_date).toLocaleDateString()}</p>
      <a href="${job.url}" target="_blank" class="apply-btn">View & Apply</a>
    `;

    jobListEl.appendChild(card);
  });
}

loadJobs();
