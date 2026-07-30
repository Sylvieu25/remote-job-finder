const statusEl = document.getElementById('status');
const jobListEl = document.getElementById('jobList');
const categoryFilterEl = document.getElementById('categoryFilter');
const searchInputEl = document.getElementById('searchInput');
const sortSelectEl = document.getElementById('sortSelect');

let allJobs = []; // full dataset, never mutated — search/filter/sort always read from this

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

    populateCategoryFilter(allJobs);
    applyFiltersAndRender();

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

// The core function: reads the current state of search + filter + sort
// controls together, and produces one final result set.
function applyFiltersAndRender() {
  const searchTerm = searchInputEl.value.trim().toLowerCase();
  const selectedCategory = categoryFilterEl.value;
  const sortValue = sortSelectEl.value;

  let result = allJobs;

  // Search: match against job title
  if (searchTerm) {
    result = result.filter(job =>
      job.title.toLowerCase().includes(searchTerm)
    );
  }

  // Filter: match selected category
  if (selectedCategory) {
    result = result.filter(job => job.category === selectedCategory);
  }

  // Sort
  result = [...result].sort((a, b) => {
    if (sortValue === 'date-desc') {
      return new Date(b.publication_date) - new Date(a.publication_date);
    }
    if (sortValue === 'date-asc') {
      return new Date(a.publication_date) - new Date(b.publication_date);
    }
    if (sortValue === 'company-asc') {
      return a.company_name.localeCompare(b.company_name);
    }
    return 0;
  });

  if (result.length === 0) {
    statusEl.textContent = 'No jobs match your search.';
  } else {
    statusEl.textContent = `Showing ${result.length} of ${allJobs.length} jobs`;
  }

  renderJobs(result);
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

// Wire up controls — every change re-runs the combined filter/sort logic
searchInputEl.addEventListener('input', applyFiltersAndRender);
categoryFilterEl.addEventListener('change', applyFiltersAndRender);
sortSelectEl.addEventListener('change', applyFiltersAndRender);

loadJobs();
