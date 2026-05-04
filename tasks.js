(function () {
  const taskFiles = [
    'flervalg-tasks/f1.md',
    'flervalg-tasks/f2.md',
    'flervalg-tasks/f3.md',
    'flervalg-tasks/f4.md',
    'flervalg-tasks/f5.md'
  ];

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

  function parseOptionLine(line) {
    const match = line.match(/^\- \[(x|X| )\]\s+(.+)$/);
    if (!match) {
      return null;
    }

    return {
      text: match[2].trim(),
      correct: match[1].toLowerCase() === 'x'
    };
  }

  function parseStatementLine(line) {
    const match = line.match(/^\- \[(s|u)\]\s+(.+)$/i);
    if (!match) {
      return null;
    }

    return {
      text: match[2].trim(),
      answer: match[1].toLowerCase()
    };
  }

  function parseSingleBlockSection(section) {
    const lines = section.body.split(/\r?\n/);
    const options = [];
    const codeLines = [];
    let insideCodeFence = false;

    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        insideCodeFence = !insideCodeFence;
        codeLines.push(line);
        continue;
      }

      if (insideCodeFence) {
        codeLines.push(line);
        continue;
      }

      const option = parseOptionLine(line.trim());
      if (option) {
        options.push(option);
        continue;
      }

      if (line.trim().length > 0) {
        codeLines.push(line);
      }
    }

    const codeMd = codeLines.join('\n').trim();
    return {
      label: section.title,
      groupId: section.title.toLowerCase().replace(/[^a-z0-9]+/g, ''),
      codeMd,
      options
    };
  }

  function parseTask(markdown) {
    const parsed = parseFrontmatter(markdown);
    const meta = parsed.meta;
    const sections = splitSections(parsed.body);
    const sectionMap = new Map(sections.map(section => [section.title.toLowerCase(), section.body]));

    const task = {
      id: meta.id,
      num: meta.num,
      title: meta.title,
      points: meta.points,
      subtitle: meta.subtitle,
      kind: meta.kind,
      conceptLabel: meta.conceptLabel
    };

    const concept = sectionMap.get('konsept') || '';
    task.conceptMd = concept;

    if (task.kind === 'truefalse') {
      task.codeMd = sectionMap.get('kode') || '';
      task.promptMd = sectionMap.get('oppgave') || '';
      task.statements = (sectionMap.get('påstander') || sectionMap.get('paastander') || '')
        .split(/\r?\n/)
        .map(line => parseStatementLine(line.trim()))
        .filter(Boolean);
      task.fasitMd = sectionMap.get('fasit') || '';
      return task;
    }

    if (task.kind === 'multiChoice') {
      task.hintMd = sectionMap.get('hint') || '';
      task.promptMd = sectionMap.get('oppgave') || '';
      task.groupId = meta.groupId;
      task.options = (sectionMap.get('valg') || '')
        .split(/\r?\n/)
        .map(line => parseOptionLine(line.trim()))
        .filter(Boolean);
      task.fasitMd = sectionMap.get('fasit') || '';
      return task;
    }

    if (task.kind === 'singleBlocks') {
      task.blocks = sections
        .filter(section => section.title.toLowerCase().startsWith('kode '))
        .map(parseSingleBlockSection);
      task.fasitMd = sectionMap.get('fasit') || '';
      return task;
    }

    return task;
  }

  async function loadTasks() {
    const tasks = [];

    for (const filePath of taskFiles) {
      const response = await fetch(filePath, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Kunne ikke laste ${filePath}: ${response.status}`);
      }

      const markdown = await response.text();
      tasks.push(parseTask(markdown));
    }

    return tasks;
  }

  window.FLERVALG_TASKS = [];
  window.FLERVALG_TASKS_READY = loadTasks().then(tasks => {
    window.FLERVALG_TASKS = tasks;
    return tasks;
  });
})();
