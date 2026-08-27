(function () {
  const filtersEl = document.getElementById('filters');
  const listEl = document.getElementById('promptList');
  const searchEl = document.getElementById('searchInput');
  const countEl = document.getElementById('resultCount');

  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const copyBtn = document.getElementById('copyBtn');
  const copyFeedback = document.getElementById('copyFeedback');

  let activeCategory = 'all';
  let currentPromptId = null;

  function renderFilters() {
    const all = document.createElement('button');
    all.className = 'filter-btn active';
    all.textContent = 'TODAS';
    all.dataset.cat = 'all';
    filtersEl.appendChild(all);

    CATEGORIES.forEach(function (c) {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = c.label.toUpperCase();
      btn.dataset.cat = c.id;
      filtersEl.appendChild(btn);
    });

    filtersEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      activeCategory = btn.dataset.cat;
      Array.from(filtersEl.children).forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      render();
    });
  }

  function matchesSearch(p, q) {
    if (!q) return true;
    const hay = (p.title + ' ' + p.description + ' ' + p.body).toLowerCase();
    return hay.includes(q);
  }

  function render() {
    const q = searchEl.value.trim().toLowerCase();
    listEl.innerHTML = '';

    let filtered = PROMPTS.filter(function (p) {
      const catOk = activeCategory === 'all' || p.category === activeCategory;
      return catOk && matchesSearch(p, q);
    });

    countEl.textContent = filtered.length + (filtered.length === 1 ? ' prompt encontrado' : ' prompts encontrados');

    if (filtered.length === 0) {
      const div = document.createElement('div');
      div.className = 'no-results';
      div.textContent = 'Nenhum prompt encontrado para essa busca.';
      listEl.appendChild(div);
      return;
    }

    const catsToRender = activeCategory === 'all'
      ? CATEGORIES
      : CATEGORIES.filter(function (c) { return c.id === activeCategory; });

    catsToRender.forEach(function (cat) {
      const items = filtered.filter(function (p) { return p.category === cat.id; });
      if (items.length === 0) return;

      const group = document.createElement('section');
      group.className = 'category-group';

      const h2 = document.createElement('h2');
      h2.innerHTML = cat.label + ' <span class="category-count">' + items.length + '</span>';
      group.appendChild(h2);

      items.forEach(function (p) {
        const card = document.createElement('article');
        card.className = 'prompt-card';
        card.innerHTML =
          '<h3>' + escapeHtml(p.title) + '</h3>' +
          '<p>' + escapeHtml(p.description) + '</p>' +
          '<div class="card-actions">' +
            '<span class="view-link">ver mais</span>' +
            '<button class="copy-btn-inline" data-id="' + p.id + '">Copiar</button>' +
          '</div>';

        card.addEventListener('click', function (e) {
          if (e.target.closest('.copy-btn-inline')) return;
          openModal(p);
        });

        group.appendChild(card);
      });

      listEl.appendChild(group);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function openModal(p) {
    currentPromptId = p.id;
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.description;
    modalBody.textContent = p.body;
    copyFeedback.textContent = '';
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  copyBtn.addEventListener('click', function () {
    const p = PROMPTS.find(function (x) { return x.id === currentPromptId; });
    if (!p) return;
    copyText(p.body).then(function () {
      copyFeedback.textContent = 'Copiado!';
      setTimeout(function () { copyFeedback.textContent = ''; }, 2000);
    });
  });

  listEl.addEventListener('click', function (e) {
    const btn = e.target.closest('.copy-btn-inline');
    if (!btn) return;
    const p = PROMPTS.find(function (x) { return x.id === btn.dataset.id; });
    if (!p) return;
    copyText(p.body).then(function () {
      const original = btn.textContent;
      btn.textContent = 'Copiado!';
      setTimeout(function () { btn.textContent = original; }, 1500);
    });
  });

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  searchEl.addEventListener('input', render);

  renderFilters();
  render();
})();
