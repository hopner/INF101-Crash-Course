(function () {
  function parseFrontmatter(markdown) {
    const trimmed = markdown.replace(/^\uFEFF/, '');
    if (!trimmed.startsWith('---')) {
      return { meta: {}, body: trimmed };
    }

    const lines = trimmed.split(/\r?\n/);
    let endIndex = -1;
    for (let index = 1; index < lines.length; index += 1) {
      if (lines[index].trim() === '---') {
        endIndex = index;
        break;
      }
    }

    if (endIndex === -1) {
      return { meta: {}, body: trimmed };
    }

    const meta = {};
    for (let index = 1; index < endIndex; index += 1) {
      const line = lines[index];
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        continue;
      }

      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      meta[key] = value;
    }

    return {
      meta,
      body: lines.slice(endIndex + 1).join('\n').trim()
    };
  }

  function splitSections(body) {
    const sections = [];
    const lines = body.split(/\r?\n/);
    let currentTitle = null;
    let currentLines = [];

    function flush() {
      if (!currentTitle) {
        return;
      }

      sections.push({
        title: currentTitle,
        body: currentLines.join('\n').trim()
      });
    }

    for (const line of lines) {
      const headingMatch = line.match(/^##\s+(.+?)\s*$/);
      if (headingMatch) {
        flush();
        currentTitle = headingMatch[1].trim();
        currentLines = [];
        continue;
      }

      currentLines.push(line);
    }

    flush();
    return sections;
  }

  async function loadMarkdownFile(filePath) {
    const response = await fetch(filePath, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Kunne ikke laste ${filePath}: ${response.status}`);
    }

    return response.text();
  }

  window.SectionMarkdown = {
    parseFrontmatter,
    splitSections,
    loadMarkdownFile
  };
})();
