(function () {
  function renderTaskFromMarkdown(markdown) {
    const parsed = window.SectionMarkdown.parseFrontmatter(markdown);
    const sections = window.SectionMarkdown.splitSections(parsed.body);
    const sectionMap = new Map(sections.map(section => [section.title.toLowerCase(), section.body]));

    const meta = parsed.meta;
    const conceptHtml = window.renderMarkdown(sectionMap.get('konsept') || '');
    const promptHtml = window.renderMarkdown(sectionMap.get('oppgave') || '');
    const fasitHtml = window.renderMarkdown(sectionMap.get('fasit') || '');

    const extraSections = sections
      .filter(section => !['konsept', 'oppgave', 'fasit'].includes(section.title.toLowerCase()))
      .map(section => `<div class="deloppgave"><div class="del-label">${section.title}</div>${window.renderMarkdown(section.body)}</div>`)
      .join('');

    return `
  <div class="oppgave" id="${meta.id}">
    <div class="oppgave-header" onclick="toggle(this)">
      <span class="oppgave-num">${meta.num}</span>
      <div class="oppgave-title-wrap">
        <div class="oppgave-title">${meta.title} <span class="points-badge">${meta.points}</span></div>
        <div class="oppgave-subtitle">${meta.subtitle}</div>
      </div>
      <span class="oppgave-chevron">▶</span>
    </div>
    <div class="oppgave-body">
      <div class="oppgave-content">
        <div class="oppgave-divider"></div>
        <div class="konsept-boks">
          <div class="konsept-label">${meta.conceptLabel}</div>
          <div class="konsept-text">${conceptHtml}</div>
        </div>

        ${promptHtml}
        ${extraSections}

        <button class="fasit-btn" onclick="toggleFasit(this)">Vis fasit</button>
        <div class="fasit-panel">
          <div class="fasit-heading">Fasit</div>
          ${fasitHtml}
        </div>
      </div>
    </div>
  </div>`;
  }

  async function loadTeoriSection() {
    const taskFiles = ['teori/t1.md', 'teori/t2.md', 'teori/t3.md'];
    const sections = [];

    for (const filePath of taskFiles) {
      const markdown = await window.SectionMarkdown.loadMarkdownFile(filePath);
      sections.push(renderTaskFromMarkdown(markdown));
    }

    window.TEORI_SECTION_HTML = `
<div class="section-block" id="teori">
  <div class="section-header">
    <span class="section-tag tag-teori">Teori</span>
    <span class="section-title">Del 3 · Teorioppgaver</span>
    <span class="section-points">24 poeng</span>
  </div>

  ${sections.join('\n')}
</div>`;

    return window.TEORI_SECTION_HTML;
  }

  window.TEORI_SECTION_READY = loadTeoriSection();
})();
