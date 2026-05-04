// Markdown rendering helpers for static pages.
// Uses marked + DOMPurify when available, and falls back safely when not.
(function () {
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitize(html) {
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      return window.DOMPurify.sanitize(html);
    }
    return html;
  }

  function fallbackBlockMarkdown(md) {
    const escaped = escapeHtml(md || '');
    const withBreaks = escaped.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
    return '<p>' + withBreaks + '</p>';
  }

  function fallbackInlineMarkdown(md) {
    return escapeHtml(md || '');
  }

  window.renderMarkdown = function renderMarkdown(md) {
    if (window.marked && typeof window.marked.parse === 'function') {
      return sanitize(window.marked.parse(md || ''));
    }

    return fallbackBlockMarkdown(md);
  };

  window.renderMarkdownInline = function renderMarkdownInline(md) {
    if (window.marked && typeof window.marked.parseInline === 'function') {
      return sanitize(window.marked.parseInline(md || ''));
    }

    return fallbackInlineMarkdown(md);
  };
})();
