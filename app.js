function renderFlervalgSection() {
  const container = document.getElementById('flervalgTasks');
  if (!container || !window.FLERVALG_TASKS) {
    return;
  }

  container.innerHTML = window.FLERVALG_TASKS.map(renderTask).join('');
}

function getBlockHtml(data, htmlKey, mdKey) {
  if (data && data[mdKey]) {
    if (window.renderMarkdown) {
      return window.renderMarkdown(data[mdKey]);
    }
    return data[mdKey];
  }

  return (data && data[htmlKey]) || '';
}

function getInlineHtml(text) {
  if (text === undefined || text === null) {
    return '';
  }

  if (window.renderMarkdownInline) {
    return window.renderMarkdownInline(String(text));
  }

  return String(text);
}

function renderProgrammeringSection() {
  const container = document.getElementById('programmeringSection');
  if (!container || !window.PROGRAMMERING_SECTION_HTML) {
    return;
  }

  container.innerHTML = window.PROGRAMMERING_SECTION_HTML;
}

function renderTeoriSection() {
  const container = document.getElementById('teoriSection');
  if (!container || !window.TEORI_SECTION_HTML) {
    return;
  }

  container.innerHTML = window.TEORI_SECTION_HTML;
}

function buildNav() {
  const container = document.getElementById('sidebarNav');
  if (!container) return;
  container.innerHTML = '';

  if (window.SLIDES_MANIFEST && window.SLIDES_MANIFEST.length > 0) {
    container.insertAdjacentHTML('beforeend', '<div class="nav-section">Slides</div>');
    window.SLIDES_MANIFEST.forEach(item => {
      const a = document.createElement('a');
      a.className = 'nav-item';
      a.href = '#slides-' + item.id;
      a.setAttribute('data-slide-id', item.id);
      a.innerHTML = `<span class="nav-dot dot-section"></span>${item.title} · slides`;
      container.appendChild(a);
    });
  }

  const groups = [
    { id: 'flervalg', label: 'Flervalg', dot: 'dot-flervalg' },
    { id: 'programmering', label: 'Programmering', dot: 'dot-programmering' },
    { id: 'teori', label: 'Teori', dot: 'dot-teori' }
  ];

  groups.forEach(g => {
    const sectionEl = document.getElementById(g.id);
    if (!sectionEl) return;

    const points = sectionEl.querySelector('.section-points')?.textContent || '';
    container.insertAdjacentHTML('beforeend', `<div class="nav-section">${g.label} ${points}</div>`);

    const items = sectionEl.querySelectorAll('.oppgave[id]');
    items.forEach(op => {
      const id = op.id;
      const num = op.querySelector('.oppgave-num')?.textContent?.trim() || id;
      const titleEl = op.querySelector('.oppgave-title');
      let titleText = '';
      if (titleEl) {
        titleText = Array.from(titleEl.childNodes).filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join('').trim();
      }

      const label = `${num} · ${titleText || (titleEl ? titleEl.textContent.trim() : id)}`;
      const a = document.createElement('a');
      a.className = 'nav-item';
      a.href = '#' + id;
      a.innerHTML = `<span class="nav-dot ${g.dot}"></span>${label}`;
      container.appendChild(a);
    });
  });
}

function renderTask(task) {
  if (task.kind === 'singleBlocks') {
    return renderSingleBlocksTask(task);
  }

  if (task.kind === 'multiChoice') {
    return renderMultiChoiceTask(task);
  }

  const rowsHtml = task.statements.map(statement => {
    const santCorrect = statement.answer === 's';
    const usantCorrect = statement.answer === 'u';
    return `
      <tr>
        <td class="stmt">${getInlineHtml(statement.text)}</td>
        <td><span class="su-opt" onclick="suVelg(this,'${task.id}',${santCorrect})">Sant</span></td>
        <td><span class="su-opt" onclick="suVelg(this,'${task.id}',${usantCorrect})">Usant</span></td>
      </tr>`;
  }).join('');

  const conceptHtml = getBlockHtml(task, 'conceptHtml', 'conceptMd');
  const codeHtml = getBlockHtml(task, 'codeHtml', 'codeMd');
  const promptHtml = getBlockHtml(task, 'promptHtml', 'promptMd');
  const fasitHtml = getBlockHtml(task, 'fasitHtml', 'fasitMd');

  return `
  <div class="oppgave" id="${task.id}">
    <div class="oppgave-header" onclick="toggle(this)">
      <span class="oppgave-num">${task.num}</span>
      <div class="oppgave-title-wrap">
        <div class="oppgave-title">${task.title} <span class="points-badge">${task.points}</span></div>
        <div class="oppgave-subtitle">${task.subtitle}</div>
      </div>
      <span class="oppgave-chevron">▶</span>
    </div>
    <div class="oppgave-body">
      <div class="oppgave-content">
        <div class="oppgave-divider"></div>
        <div class="konsept-boks">
          <div class="konsept-label">${task.conceptLabel}</div>
          <div class="konsept-text">${conceptHtml}</div>
        </div>
      ${codeHtml}
      ${promptHtml}
        <table class="su-table">
          <thead><tr><th style="width:65%">Påstand</th><th>Sant</th><th>Usant</th></tr></thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <button class="fasit-btn" onclick="toggleFasit(this)">Vis fasit</button>
        <div class="fasit-panel">
          <div class="fasit-heading">Fasit</div>
          ${fasitHtml}
        </div>
      </div>
    </div>
  </div>`;
}

function renderSingleBlocksTask(task) {
  const blocksHtml = task.blocks.map(block => {
    const optionsHtml = block.options.map(option => {
      return `
          <li class="alt-item" onclick="velgAlt(this,'${block.groupId}',${option.correct})"><span class="alt-box">□</span> ${getInlineHtml(option.text)}</li>`;
    }).join('');

    const codeHtml = getBlockHtml(block, 'codeHtml', 'codeMd');

    return `
        <p class="oppg-text" style="margin-top:1.25rem"><strong>${block.label}</strong> – Velg ett alternativ:</p>
${codeHtml}
        <ul class="alt-list" id="${block.groupId}">
          ${optionsHtml}
        </ul>`;
  }).join('');

  return renderTaskShell(task, blocksHtml);
}

function renderMultiChoiceTask(task) {
  const codeHtml = getBlockHtml(task, 'codeHtml', 'codeMd');
  const promptHtml = getBlockHtml(task, 'promptHtml', 'promptMd');
  const hintHtml = getBlockHtml(task, 'hintHtml', 'hintMd');
  const optionsHtml = task.options.map(option => {
    return `
          <li class="alt-item" onclick="velgAlt(this,'${task.groupId}',${option.correct})"><span class="alt-box">□</span> ${getInlineHtml(option.text)}</li>`;
  }).join('');

  const bodyHtml = `
${codeHtml}
${promptHtml}
${hintHtml}
        <ul class="alt-list" id="${task.groupId}" data-multi-select="true">
          ${optionsHtml}
        </ul>`;

  return renderTaskShell(task, bodyHtml);
}

function renderTaskShell(task, innerHtml) {
  const conceptHtml = getBlockHtml(task, 'conceptHtml', 'conceptMd');
  const codeHtml = getBlockHtml(task, 'codeHtml', 'codeMd');
  const promptHtml = getBlockHtml(task, 'promptHtml', 'promptMd');
  const hintHtml = getBlockHtml(task, 'hintHtml', 'hintMd');
  const fasitHtml = getBlockHtml(task, 'fasitHtml', 'fasitMd');

  return `
  <div class="oppgave" id="${task.id}">
    <div class="oppgave-header" onclick="toggle(this)">
      <span class="oppgave-num">${task.num}</span>
      <div class="oppgave-title-wrap">
        <div class="oppgave-title">${task.title} <span class="points-badge">${task.points}</span></div>
        <div class="oppgave-subtitle">${task.subtitle}</div>
      </div>
      <span class="oppgave-chevron">▶</span>
    </div>
    <div class="oppgave-body">
      <div class="oppgave-content">
        <div class="oppgave-divider"></div>
        <div class="konsept-boks">
          <div class="konsept-label">${task.conceptLabel}</div>
          <div class="konsept-text">${conceptHtml}</div>
        </div>
${codeHtml}
${promptHtml}
${hintHtml}
${innerHtml}
        <button class="fasit-btn" onclick="toggleFasit(this)">Vis fasit</button>
        <div class="fasit-panel">
          <div class="fasit-heading">Fasit</div>
          ${fasitHtml}
        </div>
      </div>
    </div>
  </div>`;
}

function toggle(header) {
  const card = header.closest('.oppgave');
  card.classList.toggle('open');
  updateProgress();
}

function toggleFasit(btn) {
  const panel = btn.nextElementSibling;
  panel.classList.toggle('show');
  btn.textContent = panel.classList.contains('show') ? 'Skjul fasit' : 'Vis fasit';
}

function velgAlt(el, group, correct) {
  const list = document.getElementById(group);
  if (!list) {
    return;
  }

  const multiSelect = list.getAttribute('data-multi-select') === 'true';

  if (multiSelect) {
    const isSelected = el.classList.contains('selected');
    const box = el.querySelector('.alt-box');

    if (isSelected) {
      el.classList.remove('selected', 'correct', 'wrong');
      if (box) {
        box.textContent = '□';
      }
      return;
    }

    el.classList.add('selected');
    el.classList.toggle('correct', !!correct);
    el.classList.toggle('wrong', !correct);
    if (box) {
      box.textContent = correct ? '✓' : '✗';
    }
    return;
  }

  list.querySelectorAll('.alt-item').forEach(item => {
    item.classList.remove('selected', 'correct', 'wrong');
    const box = item.querySelector('.alt-box');
    if (box) {
      box.textContent = '□';
    }
  });

  el.classList.add('selected');
  el.classList.add(correct ? 'correct' : 'wrong');
  const box = el.querySelector('.alt-box');
  if (box) {
    box.textContent = correct ? '✓' : '✗';
  }
}

function suVelg(el, type, correct) {
  const row = el.closest('tr');
  row.querySelectorAll('.su-opt').forEach(o => o.classList.remove('s-correct','s-wrong'));
  el.classList.add(correct ? 's-correct' : 's-wrong');
}

function updateProgress() {
  const total = document.querySelectorAll('.oppgave').length;
  const open = document.querySelectorAll('.oppgave.open').length;
  const progressFill = document.getElementById('progressFill');

  if (progressFill) {
    progressFill.style.width = total === 0 ? '0%' : (open / total * 100) + '%';
  }
}

async function initializePage() {
  if (window.SLIDES_READY) {
    await window.SLIDES_READY;
  }

  if (window.FLERVALG_TASKS_READY) {
    await window.FLERVALG_TASKS_READY;
  }

  if (window.PROGRAMMERING_SECTION_READY) {
    await window.PROGRAMMERING_SECTION_READY;
  }

  if (window.TEORI_SECTION_READY) {
    await window.TEORI_SECTION_READY;
  }

  renderFlervalgSection();
  renderProgrammeringSection();
  renderTeoriSection();
  // build navigation from rendered sections
  buildNav();
  if (window.SlidesEngine && typeof window.SlidesEngine.initialize === 'function') {
    await window.SlidesEngine.initialize();
  }
  if (window.Prism && typeof window.Prism.highlightAll === 'function') {
    window.Prism.highlightAll();
  }
  updateProgress();
  const sections = document.querySelectorAll('.oppgave[id]');
  const navItems = document.querySelectorAll('.nav-item');
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        cur = section.id;
      }
    });
    navItems.forEach(navItem => {
      navItem.classList.toggle('active', navItem.getAttribute('href') === '#' + cur);
    });
  }, {passive: true});
}

initializePage().catch(error => {
  console.error('Kunne ikke initialisere siden:', error);
});