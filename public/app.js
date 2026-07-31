const statusEl = document.getElementById('status');
const jobListEl = document.getElementById('jobList');
const categoryFilterEl = document.getElementById('categoryFilter');
const searchInputEl = document.getElementById('searchInput');
const sortSelectEl = document.getElementById('sortSelect');
const modalOverlayEl = document.getElementById('modalOverlay');
const modalContentEl = document.getElementById('modalContent');
const modalCloseEl = document.getElementById('modalClose');

let allJobs = []; // full dataset, never mutated

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

function applyFiltersAndRender() {
  const searchTerm = searchInputEl.value.trim().toLowerCase();
  const selectedCategory = categoryFilterEl.value;
  const sortValue = sortSelectEl.value;

  let result = allJobs;

  if (searchTerm) {
    result = result.filter(job =>
      job.title.toLowerCase().includes(searchTerm) ||
      job.candidate_required_location.toLowerCase().includes(searchTerm) ||
      job.company_name.toLowerCase().includes(searchTerm)
    );
  }

  if (selectedCategory) {
    result = result.filter(job => job.category === selectedCategory);
  }

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
      <div class="card-actions">
        <button class="details-btn" data-job-id="${job.id}">View Details</button>
        <a href="${job.url}" target="_blank" class="apply-btn">Apply on Remotive</a>
      </div>
    `;

    card.querySelector('.details-btn').addEventListener('click', () => openModal(job));

    jobListEl.appendChild(card);
  });
}

function openModal(job) {
  modalContentEl.innerHTML = `
    <h2>${job.title}</h2>
    <p class="modal-meta">
      ${job.company_name} — ${job.candidate_required_location}<br>
      ${job.category} · Posted: ${new Date(job.publication_date).toLocaleDateString()}
    </p>
    <div class="modal-description">${job.description}</div>
    <a href="${job.url}" target="_blank" class="apply-btn">Apply on Remotive</a>
  `;
  modalOverlayEl.classList.remove('hidden');
}

function closeModal() {
  modalOverlayEl.classList.add('hidden');
  modalContentEl.innerHTML = '';
}

modalCloseEl.addEventListener('click', closeModal);

modalOverlayEl.addEventListener('click', (e) => {
  if (e.target === modalOverlayEl) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

searchInputEl.addEventListener('input', applyFiltersAndRender);
categoryFilterEl.addEventListener('change', applyFiltersAndRender);
sortSelectEl.addEventListener('change', applyFiltersAndRender);

loadJobs();
