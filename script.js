document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('projectsGrid');
  const filters = document.getElementById('filters');
  const countLabel = document.getElementById('projectCount');
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const yearSpan = document.getElementById('year');
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const languageChart = document.getElementById('languageChart');

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', theme === 'light');
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Toggle dark mode' : 'Toggle light mode');
    }
  }

  const savedTheme = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(savedTheme || (prefersLight ? 'light' : 'dark'));

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  yearSpan.textContent = new Date().getFullYear();

  // Nav shadow on scroll
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav--shadow', window.scrollY > 8);
    }, { passive: true });
  }

  // Scroll reveal
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  function renderProjects(filter = 'All') {
    grid.innerHTML = '';
    const filtered = filter === 'All'
      ? projects
      : projects.filter(p => p.category === filter);

    filtered.forEach((project, index) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.style.animationDelay = `${index * 0.05}s`;
      card.innerHTML = `
        <span class="project-card__category">${project.category}</span>
        <h3 class="project-card__title">${project.title}</h3>
        <p class="project-card__desc">${project.description}</p>
        <div class="project-card__tags">
          ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
        </div>
        <a class="project-card__link" href="${project.code}" target="_blank" rel="noopener noreferrer">
          View on GitHub
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      `;
      grid.appendChild(card);
    });
  }

  function buildFilters() {
    const categories = Array.from(new Set(projects.map(p => p.category))).sort();
    const labels = ['All', ...categories];

    filters.innerHTML = '';
    labels.forEach((label, index) => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${index === 0 ? 'active' : ''}`;
      btn.dataset.filter = label;
      btn.textContent = label;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      btn.addEventListener('click', () => {
        Array.from(filters.children).forEach(child => {
          child.classList.remove('active');
          child.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        renderProjects(label);
      });
      filters.appendChild(btn);
    });

    if (countLabel) {
      countLabel.textContent = `${projects.length} public repositories across ${categories.length} categories.`;
    }
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  function renderLanguageChart() {
    if (!languageChart || typeof languages === 'undefined') return;
    languageChart.innerHTML = '';
    languages.forEach((lang, index) => {
      const row = document.createElement('div');
      row.className = 'language-row';
      row.style.animationDelay = `${index * 0.08}s`;
      row.innerHTML = `
        <span class="language-name">${lang.name}</span>
        <div class="language-track">
          <div class="language-bar" style="width: 0%; background: ${lang.color};"></div>
        </div>
        <span class="language-percent">${lang.percent}%</span>
      `;
      languageChart.appendChild(row);
      requestAnimationFrame(() => {
        const bar = row.querySelector('.language-bar');
        if (bar) bar.style.width = `${Math.max(lang.percent, 1)}%`;
      });
    });
  }

  renderLanguageChart();
  buildFilters();
  renderProjects();
});
