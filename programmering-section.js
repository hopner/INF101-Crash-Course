(function () {
  function renderSectionMarkdown(markdown) {
    const parsed = window.SectionMarkdown.parseFrontmatter(markdown);
    const sections = window.SectionMarkdown.splitSections(parsed.body);
    const sectionMap = new Map(sections.map(section => [section.title.toLowerCase(), section.body]));

    const meta = parsed.meta;
    const conceptHtml = window.renderMarkdown(sectionMap.get('konsept') || '');
    const promptHtml = window.renderMarkdown(sectionMap.get('oppgave') || '');
    const filesHtml = window.renderMarkdown(sectionMap.get('filer') || '');
    const hintHtml = window.renderMarkdown(sectionMap.get('hint') || '');
    const fasitHtml = window.renderMarkdown(sectionMap.get('fasit') || '');

    return `
<div class="section-block" id="programmering">
  <div class="section-header">
    <span class="section-tag tag-programmering">Programmering</span>
    <span class="section-title">Del 2 · Programmeringsoppgave</span>
    <span class="section-points">20 poeng</span>
  </div>

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
        ${filesHtml}
        ${hintHtml ? `<div class="hint-box">${hintHtml}</div>` : ''}

        <button class="fasit-btn" onclick="toggleFasit(this)">Vis fasit / løsningsforslag</button>
        <div class="fasit-panel">
          <div class="fasit-heading">Løsningsforslag — TaskList.java</div>
          ${fasitHtml}
        </div>
      </div>
    </div>
  </div>
</div>`;
  }

  async function loadProgrammeringSection() {
    const markdown = await window.SectionMarkdown.loadMarkdownFile('programmering/ITaskList.md');
    window.PROGRAMMERING_SECTION_HTML = renderSectionMarkdown(markdown);
    return window.PROGRAMMERING_SECTION_HTML;
  }

  window.PROGRAMMERING_SECTION_READY = loadProgrammeringSection();
})();
